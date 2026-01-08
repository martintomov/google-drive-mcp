import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Folder name or path (e.g., "Reports" or "/Work/2024/Reports")',
    example: 'Annual Reports',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID (defaults to root)',
    example: '1A2B3C4D5E',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class ListFolderDto {
  @ApiPropertyOptional({
    description: 'Page size (1-100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Page token for pagination',
  })
  @IsOptional()
  @IsString()
  pageToken?: string;

  @ApiPropertyOptional({
    description: 'Include items from shared drives',
    default: false,
  })
  @IsOptional()
  includeSharedDrives?: boolean;
}
