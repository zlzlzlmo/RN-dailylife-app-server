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
import { Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signup(@Body() body: SignUpUserDto) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: SignInUserDto) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Request() req) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }
}
