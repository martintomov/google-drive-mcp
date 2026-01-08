import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ApiKey } from '../auth/decorators/api-key.decorator';
import { ApiKeyData } from '../auth/auth.service';
import {
  SearchFilesDto,
  SearchFilesResponseDto,
} from './dto/search-files.dto';
import { CreateFolderDto, ListFolderDto } from './dto/folder.dto';
import {
  CreateTextFileDto,
  UpdateTextFileDto,
  UploadFileDto,
  UploadFileFromPathDto,
} from './dto/text-file.dto';
import { RenameFileDto, MoveFileDto } from './dto/manage-file.dto';

@ApiTags('Files')
@ApiSecurity('api-key')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('search')
  @ApiOperation({ summary: 'Search for files in Google Drive' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchFilesResponseDto,
  })
  async searchFiles(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: SearchFilesDto) {
    return this.filesService.searchFiles(
      apiKeyData,
      dto.query,
      dto.pageSize,
      dto.pageToken,
      dto.includeSharedDrives,
    );
  }

  @Get('folder/:id')
  @ApiOperation({ summary: 'List contents of a folder' })
  @ApiParam({
    name: 'id',
    description: 'Folder ID or path (e.g., "1A2B3C" or "/Work/Projects")',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder contents',
  })
  async listFolder(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') folderId: string,
    @Query() dto: ListFolderDto,
  ) {
    return this.filesService.listFolder(
      apiKeyData,
      folderId,
      dto.pageSize,
      dto.pageToken,
      dto.includeSharedDrives,
    );
  }

  @Post('folder')
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
  })
  async createFolder(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: CreateFolderDto) {
    return this.filesService.createFolder(apiKeyData, dto.name, dto.parentFolderId);
  }

  @Post('text')
  @ApiOperation({ summary: 'Create a text file (.txt or .md)' })
  @ApiResponse({
    status: 201,
    description: 'Text file created successfully',
  })
  async createTextFile(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: CreateTextFileDto) {
    return this.filesService.createTextFile(
      apiKeyData,
      dto.name,
      dto.content,
      dto.parentFolderId,
    );
  }

  @Put('text/:id')
  @ApiOperation({ summary: 'Update text file content' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Text file updated successfully',
  })
  async updateTextFile(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') fileId: string,
    @Body() dto: UpdateTextFileDto,
  ) {
    return this.filesService.updateTextFile(apiKeyData, fileId, dto.content);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a binary file from base64 content' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  async uploadFile(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: UploadFileDto) {
    return this.filesService.uploadFile(
      apiKeyData,
      dto.name,
      dto.content,
      dto.mimeType,
      dto.parentFolderId,
    );
  }

  @Post('upload-path')
  @ApiOperation({ summary: 'Upload a file from local file system path' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  async uploadFileFromPath(
    @ApiKey() apiKeyData: ApiKeyData,
    @Body() dto: UploadFileFromPathDto,
  ) {
    return this.filesService.uploadFileFromPath(
      apiKeyData,
      dto.filePath,
      dto.name,
      dto.parentFolderId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file or folder (move to trash)' })
  @ApiParam({ name: 'id', description: 'File or folder ID' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(@ApiKey() apiKeyData: ApiKeyData, @Param('id') fileId: string) {
    return this.filesService.deleteFile(apiKeyData, fileId);
  }

  @Patch(':id/rename')
  @ApiOperation({ summary: 'Rename a file or folder' })
  @ApiParam({ name: 'id', description: 'File or folder ID' })
  @ApiResponse({
    status: 200,
    description: 'File renamed successfully',
  })
  async renameFile(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') fileId: string,
    @Body() dto: RenameFileDto,
  ) {
    return this.filesService.renameFile(apiKeyData, fileId, dto.newName);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a file or folder to a different parent' })
  @ApiParam({ name: 'id', description: 'File or folder ID' })
  @ApiResponse({
    status: 200,
    description: 'File moved successfully',
  })
  async moveFile(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') fileId: string,
    @Body() dto: MoveFileDto,
  ) {
    return this.filesService.moveFile(apiKeyData, fileId, dto.newParentId);
  }
}
