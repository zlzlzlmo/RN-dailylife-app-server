import { IsString } from 'class-validator';

export class SignInUserDto {
  @IsString()
  userId: string;

  @IsString()
  password: string;
}
