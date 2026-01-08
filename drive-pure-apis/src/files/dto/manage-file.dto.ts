import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RenameFileDto {
  @ApiProperty({
    description: 'New name for the file or folder',
    example: 'Renamed Document.pdf',
  })
  @IsString()
  newName: string;
}

export class MoveFileDto {
  @ApiProperty({
    description: 'Target folder ID',
    example: '1A2B3C4D5E',
  })
  @IsString()
  newParentId: string;
}
