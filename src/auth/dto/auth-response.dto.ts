import { User } from 'src/user/entities/user.entity';
import { Tokens } from '../types/token.type';

export class AuthResponseDto {
  user: {
    id: number;
    email: string;
    nickname: string;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  private constructor(data: Partial<AuthResponseDto>) {
    Object.assign(this, data);
  }

  static from(user: User, tokens: Tokens): AuthResponseDto {
    return new AuthResponseDto({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  }
}
