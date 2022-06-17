import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { SignInUserDto } from './dtos/signin-user-dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp({ userId, nickName, password }: CreateUserDto): Promise<Tokens> {
    const hasEmail = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    if (hasEmail) throw new ConflictException('이미 해당 유저가 존재합니다.');

    const hasNickName = await this.prismaService.user.findUnique({
      where: {
        nickName,
      },
    });

    if (hasNickName)
      throw new ConflictException('이미 닉네임이 이미 존재합니다.');

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

  async signIn({ userId, password }: SignInUserDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    if (!user) throw new ForbiddenException('해당 유저가 존재하지 않습니다');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');

    const tokens = await this.getTokens(user.id, user.userId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async signOut(id: number) {
    // refresh 토큰이 널이 아니면 널로 만들어주기
    await this.prismaService.user.updateMany({
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
  }

  async refreshTokens() {
    return 1;
  }

  private async hashData(password: string) {
    return await bcrypt.hash(password, 10);
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

  private async updateRefreshToken(id: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        refreshToken,
      },
    });
  }
}
