import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateGoogleDocDto {
  @ApiProperty({
    description: 'Document title',
    example: 'My Document',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Initial content',
    example: 'This is the initial content of my document.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UpdateGoogleDocDto {
  @ApiProperty({
    description: 'Text content to insert',
    example: 'New paragraph content.',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'Index where to insert text (defaults to end)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  index?: number;
}

export class FormatTextDto {
  @ApiProperty({
    description: 'Start index of text to format',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  startIndex: number;

  @ApiProperty({
    description: 'End index of text to format',
    example: 10,
  })
  @IsNumber()
  @Min(1)
  endIndex: number;

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
    description: 'Make text underlined',
  })
  @IsOptional()
  @IsBoolean()
  underline?: boolean;

  @ApiPropertyOptional({
    description: 'Font size in points',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @ApiPropertyOptional({
    description: 'Foreground color (RGB object with values 0-1)',
    example: { red: 1, green: 0, blue: 0 },
  })
  @IsOptional()
  foregroundColor?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Background color (RGB object with values 0-1)',
  })
  @IsOptional()
  backgroundColor?: {
    red: number;
    green: number;
    blue: number;
  };
}

export class FormatParagraphDto {
  @ApiProperty({
    description: 'Start index of paragraph',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  startIndex: number;

  @ApiProperty({
    description: 'End index of paragraph',
    example: 50,
  })
  @IsNumber()
  @Min(1)
  endIndex: number;

  @ApiPropertyOptional({
    description: 'Heading level (1-6) or "NORMAL_TEXT"',
    example: 'HEADING_1',
  })
  @IsOptional()
  @IsString()
  headingLevel?: string;

  @ApiPropertyOptional({
    description: 'Text alignment: START, CENTER, END, JUSTIFIED',
    example: 'CENTER',
  })
  @IsOptional()
  @IsString()
  alignment?: string;

  @ApiPropertyOptional({
    description: 'Line spacing (1.0 = single, 1.5, 2.0 = double)',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber()
  lineSpacing?: number;

  @ApiPropertyOptional({
    description: 'Space above paragraph in points',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  spaceAbove?: number;

  @ApiPropertyOptional({
    description: 'Space below paragraph in points',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  spaceBelow?: number;
}
