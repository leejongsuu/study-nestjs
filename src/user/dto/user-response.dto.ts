import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  nickname: string;
  createdAt: Date;

  private constructor(data: Partial<UserResponseDto>) {
    Object.assign(this, data);
  }

  static from(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    });
  }

  static fromArray(users: User[]): UserResponseDto[] {
    return users.map((user) => this.from(user));
  }
}
