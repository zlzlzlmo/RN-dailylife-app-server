import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { Tokens } from './types';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signUp(@Body() body: CreateUserDto): Promise<Tokens> {
    return await this.userService.signUp(body);
  }

  @Post('/signin')
  signIn() {
    return this.userService.signIn();
  }

  @Post('/signout')
  signOut() {
    return this.userService.signOut();
  }

  @Post('/refresh')
  refreshTokens() {
    return this.userService.refreshTokens();
  }
}