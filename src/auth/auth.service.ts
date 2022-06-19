import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { SignInUserDto } from './dtos/signin-user-dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userSerivce: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup({ userId, password, nickName }: SignUpUserDto) {
    const hasUserId = await this.userSerivce.findUserByUserId(userId);
    if (hasUserId) throw new ForbiddenException('해당 유저가 이미 존재합니다.');

    const hasNickName = await this.userSerivce.findUserByNickName(nickName);
    if (hasNickName)
      throw new ForbiddenException('해당 닉네임이 이제 존재합니다.');

    const hashedPassword = await this.hashData(password);
    const user = await this.prismaService.user.create({
      data: {
        userId,
        nickName,
        password: hashedPassword,
      },
    });

    const tokens = await this.getTokens(user.id, user.userId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login({ password, userId }: SignInUserDto) {
    const user = await this.userSerivce.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 유저가 존재하지 않습니다.');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');

    const tokens = await this.getTokens(user.id, user.userId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(id: number) {
    // refresh 토큰이 널이 아니면 널로 만들어주기
    const user = await this.prismaService.user.updateMany({
      where: {
        id,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });

    return user;
  }

  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.userSerivce.findUserById(id);

    if (!user) throw new ForbiddenException('존재하지 않는 유저입니다');

    const rtMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('잘못된 접근');

    const tokens = await this.getTokens(user.id, user.userId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async getTokens(id: number, userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          userId,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          userId,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async hashData(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async updateRefreshToken(id: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: hash,
      },
    });
  }
}
