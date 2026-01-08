import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTextFileDto {
  @ApiProperty({
    description: 'File name (with extension, e.g., "notes.txt" or "readme.md")',
    example: 'notes.txt',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Text content of the file',
    example: 'This is my note content.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID (defaults to root)',
    example: '1A2B3C4D5E',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UpdateTextFileDto {
  @ApiProperty({
    description: 'New text content',
    example: 'Updated content here.',
  })
  @IsString()
  content: string;
}

export class UploadFileDto {
  @ApiProperty({
    description: 'File name with extension',
    example: 'document.pdf',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Base64-encoded file content',
    example: 'JVBERi0xLjQKJeLjz9MK...',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'MIME type (auto-detected if not provided)',
    example: 'application/pdf',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UploadFileFromPathDto {
  @ApiProperty({
    description: 'Local file path to upload',
    example: '/tmp/document.pdf',
  })
  @IsString()
  filePath: string;

  @ApiPropertyOptional({
    description: 'Custom name for the file (uses filename from path if not provided)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UploadPdfDto {
  @ApiProperty({
    description: 'PDF file name',
    example: 'document.pdf',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Base64-encoded PDF content',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Split mode: "none", "all" (each page), or page ranges like "1-3,5,7-9"',
    example: 'none',
    default: 'none',
  })
  @IsOptional()
  @IsString()
  splitMode?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}
