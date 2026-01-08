import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class CreateGoogleSheetDto {
  @ApiProperty({
    description: 'Spreadsheet title',
    example: 'Sales Report 2024',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Array of sheet names to create',
    example: ['Sheet1', 'Sheet2'],
  })
  @IsOptional()
  @IsArray()
  sheetNames?: string[];

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UpdateGoogleSheetDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'A1:C3',
  })
  @IsString()
  range: string;

  @ApiProperty({
    description: '2D array of values',
    example: [
      ['Name', 'Age', 'City'],
      ['John', 30, 'NYC'],
      ['Jane', 25, 'LA'],
    ],
  })
  @IsArray()
  values: any[][];
}

export class FormatCellsDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'A1:C1',
  })
  @IsString()
  range: string;

  @ApiPropertyOptional({
    description: 'Background color (RGB 0-1)',
    example: { red: 0.8, green: 0.8, blue: 0.8 },
  })
  @IsOptional()
  backgroundColor?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Horizontal alignment: LEFT, CENTER, RIGHT',
    example: 'CENTER',
  })
  @IsOptional()
  @IsString()
  horizontalAlignment?: string;

  @ApiPropertyOptional({
    description: 'Vertical alignment: TOP, MIDDLE, BOTTOM',
    example: 'MIDDLE',
  })
  @IsOptional()
  @IsString()
  verticalAlignment?: string;

  @ApiPropertyOptional({
    description: 'Text wrapping strategy: OVERFLOW_CELL, LEGACY_WRAP, CLIP, WRAP',
    example: 'WRAP',
  })
  @IsOptional()
  @IsString()
  wrapStrategy?: string;
}

export class FormatTextInCellsDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'A1:A10',
  })
  @IsString()
  range: string;

  @ApiPropertyOptional({
    description: 'Make text bold',
  })
  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @ApiPropertyOptional({
    description: 'Make text italic',
  })
  @IsOptional()
  @IsBoolean()
  italic?: boolean;

  @ApiPropertyOptional({
    description: 'Font size in points',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @ApiPropertyOptional({
    description: 'Font family',
    example: 'Arial',
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({
    description: 'Text color (RGB 0-1)',
  })
  @IsOptional()
  foregroundColor?: {
    red: number;
    green: number;
    blue: number;
  };
}

export class FormatNumbersDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'B2:B10',
  })
  @IsString()
  range: string;

  @ApiProperty({
    description: 'Number format type: NUMBER, CURRENCY, PERCENT, DATE, TIME, DATE_TIME, SCIENTIFIC',
    example: 'CURRENCY',
  })
  @IsString()
  formatType: string;

  @ApiPropertyOptional({
    description: 'Custom pattern (e.g., "$#,##0.00" for currency)',
    example: '$#,##0.00',
  })
  @IsOptional()
  @IsString()
  pattern?: string;
}

export class SetBordersDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'A1:C10',
  })
  @IsString()
  range: string;

  @ApiPropertyOptional({
    description: 'Border style: SOLID, SOLID_MEDIUM, SOLID_THICK, DOTTED, DASHED',
    example: 'SOLID',
  })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({
    description: 'Border color (RGB 0-1)',
  })
  @IsOptional()
  color?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Apply border to top',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  top?: boolean;

  @ApiPropertyOptional({
    description: 'Apply border to bottom',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  bottom?: boolean;

  @ApiPropertyOptional({
    description: 'Apply border to left',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  left?: boolean;

  @ApiPropertyOptional({
    description: 'Apply border to right',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  right?: boolean;
}

export class MergeCellsDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range to merge (A1 notation)',
    example: 'A1:C1',
  })
  @IsString()
  range: string;

  @ApiPropertyOptional({
    description: 'Merge type: MERGE_ALL, MERGE_COLUMNS, MERGE_ROWS',
    example: 'MERGE_ALL',
    default: 'MERGE_ALL',
  })
  @IsOptional()
  @IsString()
  mergeType?: string;
}

export class ConditionalFormatDto {
  @ApiProperty({
    description: 'Sheet name or ID',
    example: 'Sheet1',
  })
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Cell range (A1 notation)',
    example: 'B2:B10',
  })
  @IsString()
  range: string;

  @ApiProperty({
    description: 'Condition type: NUMBER_GREATER, NUMBER_LESS, TEXT_CONTAINS, DATE_BEFORE, etc.',
    example: 'NUMBER_GREATER',
  })
  @IsString()
  conditionType: string;

  @ApiProperty({
    description: 'Condition value(s)',
    example: ['100'],
  })
  @IsArray()
  values: any[];

  @ApiPropertyOptional({
    description: 'Background color when condition is met (RGB 0-1)',
    example: { red: 0, green: 1, blue: 0 },
  })
  @IsOptional()
  backgroundColor?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Text color when condition is met (RGB 0-1)',
  })
  @IsOptional()
  foregroundColor?: {
    red: number;
    green: number;
    blue: number;
  };
}
