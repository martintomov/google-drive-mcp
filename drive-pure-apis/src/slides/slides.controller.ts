import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { SlidesService } from './slides.service';
import { ApiKey } from '../auth/decorators/api-key.decorator';
import { ApiKeyData } from '../auth/auth.service';
import {
  CreateGoogleSlidesDto,
  CreateSlideTextBoxDto,
  CreateSlideShapeDto,
  FormatSlideTextDto,
  FormatSlideParagraphDto,
  StyleSlideShapeDto,
  SetSlideBackgroundDto,
} from './dto/slides.dto';

@ApiTags('Slides')
@ApiSecurity('api-key')
@Controller('slides')
export class SlidesController {
  constructor(private slidesService: SlidesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Google Slides presentation' })
  @ApiResponse({
    status: 201,
    description: 'Presentation created successfully',
  })
  async createPresentation(
    @ApiKey() apiKeyData: ApiKeyData,
    @Body() dto: CreateGoogleSlidesDto,
  ) {
    return this.slidesService.createPresentation(
      apiKeyData,
      dto.title,
      dto.slideCount,
      dto.parentFolderId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Google Slides presentation content' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 200,
    description: 'Presentation content retrieved',
  })
  async getPresentation(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
  ) {
    return this.slidesService.getPresentationContent(apiKeyData, presentationId);
  }

  @Post(':id/textbox')
  @ApiOperation({ summary: 'Create a text box on a slide' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 201,
    description: 'Text box created successfully',
  })
  async createTextBox(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: CreateSlideTextBoxDto,
  ) {
    return this.slidesService.createTextBox(
      apiKeyData,
      presentationId,
      dto.slideIndex,
      dto.text,
      dto.x,
      dto.y,
      dto.width,
      dto.height,
    );
  }

  @Post(':id/shape')
  @ApiOperation({ summary: 'Create a shape on a slide' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 201,
    description: 'Shape created successfully',
  })
  async createShape(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: CreateSlideShapeDto,
  ) {
    return this.slidesService.createShape(
      apiKeyData,
      presentationId,
      dto.slideIndex,
      dto.shapeType,
      dto.x,
      dto.y,
      dto.width,
      dto.height,
    );
  }

  @Patch(':id/format-text')
  @ApiOperation({ summary: 'Format text in a text box or shape' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 200,
    description: 'Text formatted successfully',
  })
  async formatText(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: FormatSlideTextDto,
  ) {
    return this.slidesService.formatText(
      apiKeyData,
      presentationId,
      dto.elementId,
      dto,
      dto.startIndex,
      dto.endIndex,
    );
  }

  @Patch(':id/format-paragraph')
  @ApiOperation({ summary: 'Format paragraph (alignment, spacing, bullets)' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 200,
    description: 'Paragraph formatted successfully',
  })
  async formatParagraph(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: FormatSlideParagraphDto,
  ) {
    return this.slidesService.formatParagraph(apiKeyData, presentationId, dto.elementId, dto);
  }

  @Patch(':id/style-shape')
  @ApiOperation({ summary: 'Style a shape (fill color, outline)' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 200,
    description: 'Shape styled successfully',
  })
  async styleShape(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: StyleSlideShapeDto,
  ) {
    return this.slidesService.styleShape(
      apiKeyData,
      presentationId,
      dto.elementId,
      dto.fillColor,
      dto.outlineColor,
      dto.outlineWeight,
    );
  }

  @Patch(':id/background')
  @ApiOperation({ summary: 'Set slide background color' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @ApiResponse({
    status: 200,
    description: 'Background set successfully',
  })
  async setBackground(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') presentationId: string,
    @Body() dto: SetSlideBackgroundDto,
  ) {
    return this.slidesService.setSlideBackground(
      apiKeyData,
      presentationId,
      dto.slideIndex,
      dto.color,
    );
  }
}
