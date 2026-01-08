import { Controller, Get, Post, Put, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { DocsService } from './docs.service';
import { ApiKey } from '../auth/decorators/api-key.decorator';
import { ApiKeyData } from '../auth/auth.service';
import {
  CreateGoogleDocDto,
  UpdateGoogleDocDto,
  FormatTextDto,
  FormatParagraphDto,
} from './dto/docs.dto';

@ApiTags('Docs')
@ApiSecurity('api-key')
@Controller('docs')
export class DocsController {
  constructor(private docsService: DocsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Google Doc' })
  @ApiResponse({
    status: 201,
    description: 'Google Doc created successfully',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        title: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  async createDoc(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: CreateGoogleDocDto) {
    return this.docsService.createDoc(
      apiKeyData,
      dto.title,
      dto.content,
      dto.parentFolderId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Google Doc content (insert text)' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Content added successfully',
  })
  async updateDoc(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') documentId: string,
    @Body() dto: UpdateGoogleDocDto,
  ) {
    return this.docsService.updateDoc(apiKeyData, documentId, dto.text, dto.index);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Google Doc content' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document content retrieved',
  })
  async getDoc(@ApiKey() apiKeyData: ApiKeyData, @Param('id') documentId: string) {
    return this.docsService.getDocContent(apiKeyData, documentId);
  }

  @Patch(':id/format-text')
  @ApiOperation({ summary: 'Format text in Google Doc' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Text formatted successfully',
  })
  async formatText(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') documentId: string,
    @Body() dto: FormatTextDto,
  ) {
    return this.docsService.formatText(
      apiKeyData,
      documentId,
      dto.startIndex,
      dto.endIndex,
      dto,
    );
  }

  @Patch(':id/format-paragraph')
  @ApiOperation({ summary: 'Format paragraph in Google Doc' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Paragraph formatted successfully',
  })
  async formatParagraph(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') documentId: string,
    @Body() dto: FormatParagraphDto,
  ) {
    return this.docsService.formatParagraph(
      apiKeyData,
      documentId,
      dto.startIndex,
      dto.endIndex,
      dto,
    );
  }
}
