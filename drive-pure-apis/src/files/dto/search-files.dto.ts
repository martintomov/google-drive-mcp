import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchFilesDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'annual report',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Page size (1-100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Page token for pagination',
    example: 'ABC123',
  })
  @IsOptional()
  @IsString()
  pageToken?: string;

  @ApiPropertyOptional({
    description: 'Include items from shared drives',
    example: false,
    default: false,
  })
  @IsOptional()
  includeSharedDrives?: boolean;
}

export class SearchFilesResponseDto {
  @ApiProperty({
    description: 'Array of found files',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        mimeType: { type: 'string' },
        webViewLink: { type: 'string' },
        createdTime: { type: 'string' },
        modifiedTime: { type: 'string' },
      },
    },
  })
  files: any[];

  @ApiPropertyOptional({
    description: 'Token for next page',
    type: 'string',
  })
  nextPageToken?: string;
}
