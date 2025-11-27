import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string' })
  @MaxLength(5000, { message: 'Body must not exceed 5000 characters' })
  body?: string;
}

