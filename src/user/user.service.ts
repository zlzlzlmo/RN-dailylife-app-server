import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  async findUserByUserId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        userId,
      },
    });

    return user;
  }

  async findUserByNickName(nickName: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        nickName,
      },
    });
    return user;
  }
}
