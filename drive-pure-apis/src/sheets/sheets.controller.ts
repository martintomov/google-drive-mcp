import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { SheetsService } from './sheets.service';
import { ApiKey } from '../auth/decorators/api-key.decorator';
import { ApiKeyData } from '../auth/auth.service';
import {
  CreateGoogleSheetDto,
  UpdateGoogleSheetDto,
  FormatCellsDto,
  FormatTextInCellsDto,
  FormatNumbersDto,
  SetBordersDto,
  MergeCellsDto,
  ConditionalFormatDto,
} from './dto/sheets.dto';

@ApiTags('Sheets')
@ApiSecurity('api-key')
@Controller('sheets')
export class SheetsController {
  constructor(private sheetsService: SheetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Google Sheet' })
  @ApiResponse({
    status: 201,
    description: 'Spreadsheet created successfully',
  })
  async createSheet(@ApiKey() apiKeyData: ApiKeyData, @Body() dto: CreateGoogleSheetDto) {
    return this.sheetsService.createSheet(
      apiKeyData,
      dto.title,
      dto.sheetNames,
      dto.parentFolderId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cells in a Google Sheet' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Cells updated successfully',
  })
  async updateSheet(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: UpdateGoogleSheetDto,
  ) {
    return this.sheetsService.updateSheet(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto.values,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Google Sheet content' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Sheet content retrieved',
  })
  async getSheet(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Query('sheetName') sheetName?: string,
  ) {
    return this.sheetsService.getSheetContent(apiKeyData, spreadsheetId, sheetName);
  }

  @Patch(':id/format-cells')
  @ApiOperation({ summary: 'Format cells (background, alignment, wrapping)' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Cells formatted successfully',
  })
  async formatCells(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: FormatCellsDto,
  ) {
    return this.sheetsService.formatCells(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto,
    );
  }

  @Patch(':id/format-text')
  @ApiOperation({ summary: 'Format text in cells (font, color, bold, italic)' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Text formatted successfully',
  })
  async formatText(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: FormatTextInCellsDto,
  ) {
    return this.sheetsService.formatTextInCells(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto,
    );
  }

  @Patch(':id/format-numbers')
  @ApiOperation({ summary: 'Format numbers, dates, and currency' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Number format applied successfully',
  })
  async formatNumbers(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: FormatNumbersDto,
  ) {
    return this.sheetsService.formatNumbers(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto.formatType,
      dto.pattern,
    );
  }

  @Patch(':id/borders')
  @ApiOperation({ summary: 'Set cell borders' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Borders applied successfully',
  })
  async setBorders(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: SetBordersDto,
  ) {
    return this.sheetsService.setBorders(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto.style || 'SOLID',
      dto.color,
      {
        top: dto.top,
        bottom: dto.bottom,
        left: dto.left,
        right: dto.right,
      },
    );
  }

  @Patch(':id/merge')
  @ApiOperation({ summary: 'Merge cells' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Cells merged successfully',
  })
  async mergeCells(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: MergeCellsDto,
  ) {
    return this.sheetsService.mergeCells(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto.mergeType,
    );
  }

  @Post(':id/conditional-format')
  @ApiOperation({ summary: 'Add conditional formatting rule' })
  @ApiParam({ name: 'id', description: 'Spreadsheet ID' })
  @ApiResponse({
    status: 201,
    description: 'Conditional formatting added successfully',
  })
  async addConditionalFormat(
    @ApiKey() apiKeyData: ApiKeyData,
    @Param('id') spreadsheetId: string,
    @Body() dto: ConditionalFormatDto,
  ) {
    return this.sheetsService.addConditionalFormat(
      apiKeyData,
      spreadsheetId,
      dto.sheetName,
      dto.range,
      dto.conditionType,
      dto.values,
      dto.backgroundColor,
      dto.foregroundColor,
    );
  }
}
