import { Injectable } from '@nestjs/common';
import { GoogleService } from '../google/google.service';
import { ApiKeyData } from '../auth/auth.service';

@Injectable()
export class DocsService {
  constructor(private googleService: GoogleService) {}

  /**
   * Create a new Google Doc
   */
  async createDoc(apiKeyData: ApiKeyData, title: string, content?: string, parentFolderId?: string) {
    const docs = await this.googleService.getDocsClient(apiKeyData);
    const drive = await this.googleService.getDriveClient(apiKeyData);

    // Create the document
    const doc = await docs.documents.create({
      requestBody: {
        title,
      },
    });

    const docId = doc.data.documentId!;

    // Move to parent folder if specified
    if (parentFolderId) {
      await drive.files.update({
        fileId: docId,
        addParents: parentFolderId,
        fields: 'id, parents',
      });
    }

    // Add initial content if provided
    if (content) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    return {
      documentId: docId,
      title,
      url: `https://docs.google.com/document/d/${docId}/edit`,
    };
  }

  /**
   * Update Google Doc content (insert text)
   */
  async updateDoc(apiKeyData: ApiKeyData, documentId: string, text: string, index?: number) {
    const docs = await this.googleService.getDocsClient(apiKeyData);

    // If no index specified, append to end
    let insertIndex = index;
    if (insertIndex === undefined) {
      const doc = await docs.documents.get({ documentId });
      insertIndex = doc.data.body?.content?.[0]?.endIndex || 1;
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: insertIndex },
              text,
            },
          },
        ],
      },
    });

    return {
      documentId,
      insertedAt: insertIndex,
      message: 'Content added successfully',
    };
  }

  /**
   * Get Google Doc content
   */
  async getDocContent(apiKeyData: ApiKeyData, documentId: string) {
    const docs = await this.googleService.getDocsClient(apiKeyData);

    const doc = await docs.documents.get({
      documentId,
    });

    return {
      documentId,
      title: doc.data.title,
      body: doc.data.body,
      revisionId: doc.data.revisionId,
    };
  }

  /**
   * Format text in Google Doc
   */
  async formatText(
    apiKeyData: ApiKeyData,
    documentId: string,
    startIndex: number,
    endIndex: number,
    formatting: any,
  ) {
    const docs = await this.googleService.getDocsClient(apiKeyData);

    const textStyle: any = {};
    const fields: string[] = [];

    if (formatting.bold !== undefined) {
      textStyle.bold = formatting.bold;
      fields.push('bold');
    }
    if (formatting.italic !== undefined) {
      textStyle.italic = formatting.italic;
      fields.push('italic');
    }
    if (formatting.underline !== undefined) {
      textStyle.underline = formatting.underline;
      fields.push('underline');
    }
    if (formatting.fontSize !== undefined) {
      textStyle.fontSize = { magnitude: formatting.fontSize, unit: 'PT' };
      fields.push('fontSize');
    }
    if (formatting.foregroundColor !== undefined) {
      textStyle.foregroundColor = {
        color: {
          rgbColor: formatting.foregroundColor,
        },
      };
      fields.push('foregroundColor');
    }
    if (formatting.backgroundColor !== undefined) {
      textStyle.backgroundColor = {
        color: {
          rgbColor: formatting.backgroundColor,
        },
      };
      fields.push('backgroundColor');
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              range: {
                startIndex,
                endIndex,
              },
              textStyle,
              fields: fields.join(','),
            },
          },
        ],
      },
    });

    return {
      documentId,
      message: 'Text formatted successfully',
    };
  }

  /**
   * Format paragraph in Google Doc
   */
  async formatParagraph(
    apiKeyData: ApiKeyData,
    documentId: string,
    startIndex: number,
    endIndex: number,
    formatting: any,
  ) {
    const docs = await this.googleService.getDocsClient(apiKeyData);

    const paragraphStyle: any = {};
    const fields: string[] = [];

    if (formatting.headingLevel !== undefined) {
      paragraphStyle.namedStyleType = formatting.headingLevel;
      fields.push('namedStyleType');
    }
    if (formatting.alignment !== undefined) {
      paragraphStyle.alignment = formatting.alignment;
      fields.push('alignment');
    }
    if (formatting.lineSpacing !== undefined) {
      paragraphStyle.lineSpacing = formatting.lineSpacing * 100; // Convert to percentage
      fields.push('lineSpacing');
    }
    if (formatting.spaceAbove !== undefined) {
      paragraphStyle.spaceAbove = { magnitude: formatting.spaceAbove, unit: 'PT' };
      fields.push('spaceAbove');
    }
    if (formatting.spaceBelow !== undefined) {
      paragraphStyle.spaceBelow = { magnitude: formatting.spaceBelow, unit: 'PT' };
      fields.push('spaceBelow');
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            updateParagraphStyle: {
              range: {
                startIndex,
                endIndex,
              },
              paragraphStyle,
              fields: fields.join(','),
            },
          },
        ],
      },
    });

    return {
      documentId,
      message: 'Paragraph formatted successfully',
    };
  }
}
