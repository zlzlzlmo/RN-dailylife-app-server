import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUserId } from 'src/common/decorators';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
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
  signOut(@GetCurrentUserId() id: number) {
    return this.userService.signOut(id);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() id: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.userService.refreshTokens(id, refreshToken);
  }
}
