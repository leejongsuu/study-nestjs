import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorMessages } from 'src/common/constants/error-messages';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { Role } from './types/role.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  private async findUserOrThrow(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }
    return user;
  }

  async findUserById(id: number): Promise<User> {
    return await this.findUserOrThrow(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.userRepository.existByEmail(email);
  }

  async createUser(payload: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(payload);
    this.logger.log(`User created: ${user.id} (${user.email})`);
    return user;
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserResponseDto.fromArray(users);
  }

  async getUser(id: number): Promise<UserResponseDto> {
    const user = await this.findUserOrThrow(id);
    return UserResponseDto.from(user);
  }

  async updateUser(
    id: number,
    payload: UpdateUserDto,
    userId: number,
    userRole: Role,
  ): Promise<UserResponseDto> {
    if (userId !== id && userRole !== Role.ADMIN) {
      throw new UnauthorizedException(ErrorMessages.USER.UNAUTHORIZED);
    }
    const user = await this.findUserOrThrow(id);

    Object.assign(user, payload);
    const updatedUser = await this.userRepository.update(user);
    this.logger.log(`User updated: ${id}`);

    return UserResponseDto.from(updatedUser);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    return this.userRepository.updateRefreshToken(userId, refreshToken);
  }

  async deleteUser(id: number, userId: number, userRole: Role): Promise<void> {
    if (userId !== id && userRole !== Role.ADMIN) {
      throw new UnauthorizedException(ErrorMessages.USER.UNAUTHORIZED);
    }
    await this.findUserOrThrow(id);
    await this.userRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }
}
