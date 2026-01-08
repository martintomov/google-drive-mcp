import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateGoogleSlidesDto {
  @ApiProperty({
    description: 'Presentation title',
    example: 'Q4 2024 Report',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Number of blank slides to create',
    example: 5,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  slideCount?: number;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class CreateSlideTextBoxDto {
  @ApiProperty({
    description: 'Slide index (0-based)',
    example: 0,
  })
  @IsNumber()
  slideIndex: number;

  @ApiProperty({
    description: 'Text content',
    example: 'Welcome to our presentation',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'X position in EMU (1 inch = 914400 EMU)',
    example: 914400,
    default: 914400,
  })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({
    description: 'Y position in EMU',
    example: 914400,
    default: 914400,
  })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional({
    description: 'Width in EMU',
    example: 3000000,
    default: 3000000,
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in EMU',
    example: 1000000,
    default: 1000000,
  })
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class CreateSlideShapeDto {
  @ApiProperty({
    description: 'Slide index (0-based)',
    example: 0,
  })
  @IsNumber()
  slideIndex: number;

  @ApiProperty({
    description: 'Shape type: RECTANGLE, ELLIPSE, TRIANGLE, etc.',
    example: 'RECTANGLE',
  })
  @IsString()
  shapeType: string;

  @ApiPropertyOptional({
    description: 'X position in EMU',
    example: 914400,
  })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({
    description: 'Y position in EMU',
    example: 914400,
  })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional({
    description: 'Width in EMU',
    example: 2000000,
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in EMU',
    example: 2000000,
  })
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class FormatSlideTextDto {
  @ApiProperty({
    description: 'Element ID (text box or shape ID)',
    example: 'g123abc456',
  })
  @IsString()
  elementId: string;

  @ApiPropertyOptional({
    description: 'Start index of text to format',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  startIndex?: number;

  @ApiPropertyOptional({
    description: 'End index of text to format',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  endIndex?: number;

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
    example: 24,
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

export class FormatSlideParagraphDto {
  @ApiProperty({
    description: 'Element ID',
    example: 'g123abc456',
  })
  @IsString()
  elementId: string;

  @ApiPropertyOptional({
    description: 'Text alignment: START, CENTER, END, JUSTIFIED',
    example: 'CENTER',
  })
  @IsOptional()
  @IsString()
  alignment?: string;

  @ApiPropertyOptional({
    description: 'Line spacing (100 = single spacing)',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  lineSpacing?: number;

  @ApiPropertyOptional({
    description: 'Add bullet points',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  bullet?: boolean;
}

export class StyleSlideShapeDto {
  @ApiProperty({
    description: 'Shape element ID',
    example: 'g123abc456',
  })
  @IsString()
  elementId: string;

  @ApiPropertyOptional({
    description: 'Fill color (RGB 0-1)',
  })
  @IsOptional()
  fillColor?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Outline color (RGB 0-1)',
  })
  @IsOptional()
  outlineColor?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiPropertyOptional({
    description: 'Outline weight in EMU',
    example: 12700,
  })
  @IsOptional()
  @IsNumber()
  outlineWeight?: number;
}

export class SetSlideBackgroundDto {
  @ApiProperty({
    description: 'Slide index (0-based)',
    example: 0,
  })
  @IsNumber()
  slideIndex: number;

  @ApiProperty({
    description: 'Background color (RGB 0-1)',
    example: { red: 0.9, green: 0.9, blue: 0.9 },
  })
  color: {
    red: number;
    green: number;
    blue: number;
  };
}
