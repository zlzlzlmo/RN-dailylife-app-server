import { IsString } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  userId: string;

  @IsString()
  nickName: string;

  @IsString()
  password: string;
}
