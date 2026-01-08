import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GoogleService } from '../google/google.service';
import { ApiKeyData } from '../auth/auth.service';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class FilesService {
  constructor(private googleService: GoogleService) {}

  /**
   * Search for files in Google Drive
   */
  async searchFiles(
    apiKeyData: ApiKeyData,
    query: string,
    pageSize = 20,
    pageToken?: string,
    includeSharedDrives = false,
  ) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const response = await drive.files.list({
      q: `fullText contains '${query.replace(/'/g, "\\'")}'`,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size)',
      pageSize,
      pageToken,
      includeItemsFromAllDrives: includeSharedDrives,
      supportsAllDrives: includeSharedDrives,
    });

    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken,
    };
  }

  /**
   * List contents of a folder
   */
  async listFolder(
    apiKeyData: ApiKeyData,
    folderId: string,
    pageSize = 20,
    pageToken?: string,
    includeSharedDrives = false,
  ) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    // Resolve path if it starts with /
    const resolvedFolderId = await this.resolvePath(apiKeyData, folderId);

    const response = await drive.files.list({
      q: `'${resolvedFolderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size)',
      pageSize,
      pageToken,
      includeItemsFromAllDrives: includeSharedDrives,
      supportsAllDrives: includeSharedDrives,
    });

    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken,
    };
  }

  /**
   * Create a folder
   */
  async createFolder(apiKeyData: ApiKeyData, name: string, parentFolderId?: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    // Handle path-based folder creation
    if (name.startsWith('/')) {
      return this.createFolderPath(apiKeyData, name);
    }

    const fileMetadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      const resolvedParentId = await this.resolvePath(apiKeyData, parentFolderId);
      fileMetadata.parents = [resolvedParentId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, webViewLink',
    });

    return response.data;
  }

  /**
   * Create text file (.txt or .md)
   */
  async createTextFile(
    apiKeyData: ApiKeyData,
    name: string,
    content: string,
    parentFolderId?: string,
  ) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const fileMetadata: any = {
      name,
      mimeType: 'text/plain',
    };

    if (parentFolderId) {
      const resolvedParentId = await this.resolvePath(apiKeyData, parentFolderId);
      fileMetadata.parents = [resolvedParentId];
    }

    const media = {
      mimeType: 'text/plain',
      body: Readable.from([content]),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, webViewLink',
    });

    return response.data;
  }

  /**
   * Update text file content
   */
  async updateTextFile(apiKeyData: ApiKeyData, fileId: string, content: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const media = {
      mimeType: 'text/plain',
      body: Readable.from([content]),
    };

    const response = await drive.files.update({
      fileId,
      media,
      fields: 'id, name, mimeType, modifiedTime',
    });

    return response.data;
  }

  /**
   * Upload binary file from base64 content
   */
  async uploadFile(
    apiKeyData: ApiKeyData,
    name: string,
    base64Content: string,
    mimeType?: string,
    parentFolderId?: string,
  ) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    // Decode base64 content
    const buffer = Buffer.from(base64Content, 'base64');

    // Auto-detect MIME type if not provided
    if (!mimeType) {
      mimeType = this.getMimeTypeFromFilename(name);
    }

    const fileMetadata: any = {
      name,
      mimeType,
    };

    if (parentFolderId) {
      const resolvedParentId = await this.resolvePath(apiKeyData, parentFolderId);
      fileMetadata.parents = [resolvedParentId];
    }

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size, webViewLink',
    });

    return response.data;
  }

  /**
   * Upload file from local file path
   */
  async uploadFileFromPath(
    apiKeyData: ApiKeyData,
    filePath: string,
    customName?: string,
    parentFolderId?: string,
  ) {
    // Read file from disk
    const buffer = await fs.readFile(filePath);
    const base64Content = buffer.toString('base64');
    const fileName = customName || path.basename(filePath);

    return this.uploadFile(apiKeyData, fileName, base64Content, undefined, parentFolderId);
  }

  /**
   * Delete a file or folder (move to trash)
   */
  async deleteFile(apiKeyData: ApiKeyData, fileId: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    await drive.files.update({
      fileId,
      requestBody: { trashed: true },
    });

    return { success: true, message: 'File moved to trash' };
  }

  /**
   * Rename a file or folder
   */
  async renameFile(apiKeyData: ApiKeyData, fileId: string, newName: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const response = await drive.files.update({
      fileId,
      requestBody: { name: newName },
      fields: 'id, name, modifiedTime',
    });

    return response.data;
  }

  /**
   * Move a file or folder
   */
  async moveFile(apiKeyData: ApiKeyData, fileId: string, newParentId: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);

    // Get current parents
    const file = await drive.files.get({
      fileId,
      fields: 'parents',
    });

    const previousParents = file.data.parents?.join(',');

    const response = await drive.files.update({
      fileId,
      addParents: newParentId,
      removeParents: previousParents,
      fields: 'id, name, parents',
    });

    return response.data;
  }

  /**
   * Resolve a path (like /Work/Projects) to a folder ID
   */
  private async resolvePath(apiKeyData: ApiKeyData, pathOrId: string): Promise<string> {
    // If it doesn't start with /, it's already an ID
    if (!pathOrId.startsWith('/')) {
      return pathOrId;
    }

    const drive = await this.googleService.getDriveClient(apiKeyData);
    const parts = pathOrId.split('/').filter((p) => p.length > 0);

    let currentParentId = 'root';

    for (const part of parts) {
      const response = await drive.files.list({
        q: `name='${part.replace(/'/g, "\\'")}' and '${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
      });

      if (!response.data.files || response.data.files.length === 0) {
        throw new NotFoundException(`Folder not found: ${pathOrId}`);
      }

      currentParentId = response.data.files[0].id!;
    }

    return currentParentId;
  }

  /**
   * Create folder path (like mkdir -p)
   */
  private async createFolderPath(apiKeyData: ApiKeyData, folderPath: string) {
    const drive = await this.googleService.getDriveClient(apiKeyData);
    const parts = folderPath.split('/').filter((p) => p.length > 0);

    let currentParentId = 'root';
    let lastCreatedFolder: any = null;

    for (const part of parts) {
      // Check if folder exists
      const existing = await drive.files.list({
        q: `name='${part.replace(/'/g, "\\'")}' and '${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (existing.data.files && existing.data.files.length > 0) {
        currentParentId = existing.data.files[0].id!;
        lastCreatedFolder = existing.data.files[0];
      } else {
        // Create folder
        const response = await drive.files.create({
          requestBody: {
            name: part,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [currentParentId],
          },
          fields: 'id, name, mimeType, webViewLink',
        });

        currentParentId = response.data.id!;
        lastCreatedFolder = response.data;
      }
    }

    return lastCreatedFolder;
  }

  /**
   * Get MIME type from filename extension
   */
  private getMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.zip': 'application/zip',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.csv': 'text/csv',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
