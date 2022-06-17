import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser({ email, nickName, password }: CreateUserDto) {
    const hasEmail = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (hasEmail) throw new ConflictException('이미 해당 유저가 존재합니다.');

    const hasNickName = await this.prismaService.user.findUnique({
      where: {
        nick_name: nickName,
      },
    });

    if (hasNickName)
      throw new ConflictException('이미 닉네임이 이미 존재합니다.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        nick_name: nickName,
        password: hashedPassword,
      },
    });
    return this.generateJWT(user.email, user.id);
  }

  private async generateJWT(email: string, id: number) {
    const token = await jwt.sign(
      {
        name: email,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: 360000,
      },
    );

    return token;
  }
}
