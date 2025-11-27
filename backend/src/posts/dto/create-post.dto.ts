import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  @MaxLength(5000, { message: 'Body must not exceed 5000 characters' })
  body: string;
}

