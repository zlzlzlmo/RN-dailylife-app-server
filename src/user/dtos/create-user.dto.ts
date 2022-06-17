import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsString()
  nickName: string;

  @IsString()
  password: string;
}
