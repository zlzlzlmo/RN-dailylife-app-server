import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user-dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guard';
import { Tokens } from './types';
import { UserService } from './user.service';

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

  @UseGuards(AccessTokenGuard)
  @Post('/signout')
  @HttpCode(HttpStatus.OK)
  signOut(@Request() req) {
    const user = req.user;
    console.log('user : ', user);
    return this.userService.signOut(user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Request() req) {
    const user = req.user;
    console.log(user['sub']);
    return this.userService.refreshTokens(user['sub'], user['refreshToken']);
  }
}
