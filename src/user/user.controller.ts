import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user-dto';
import { Tokens } from './types';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: CreateUserDto): Promise<Tokens> {
    return await this.userService.signUp(body);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() body: SignInUserDto): Promise<Tokens> {
    return this.userService.signIn(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/signout')
  @HttpCode(HttpStatus.OK)
  signOut(@Req() req: Request) {
    const user = req.user;
    return this.userService.signOut(user['id']);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens() {
    return this.userService.refreshTokens();
  }
}
