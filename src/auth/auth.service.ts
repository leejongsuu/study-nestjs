import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorMessages } from 'src/common/constants/error-messages';
import { Role } from 'src/user/types/role.enum';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from './types/token.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, nickname } = registerDto;

    const existingUser = await this.userService.existsByEmail(email);

    if (existingUser) {
      throw new ConflictException(ErrorMessages.AUTH.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      nickname,
    });

    this.logger.log(`User registered: ${user.id} (${user.email})`);

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return AuthResponseDto.from(user, tokens);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    this.logger.log(`User logged in: ${user.id} (${user.email})`);

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return AuthResponseDto.from(user, tokens);
  }

  async refreshAccessToken(
    userId: number,
    refreshToken: string,
  ): Promise<Tokens> {
    const user = await this.userService.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(ErrorMessages.AUTH.ACCESS_DENIED);
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException(ErrorMessages.AUTH.ACCESS_DENIED);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.updateRefreshToken(userId, null);
    this.logger.log(`User logged out: ${userId}`);
  }

  private async generateTokens(
    userId: number,
    email: string,
    role: Role,
  ): Promise<Tokens> {
    const payload = { sub: userId, email, role };

    const accessTokenExpiresIn = Number(
      this.configService.get('JWT_ACCESS_EXPIRATION'),
    );
    const refreshTokenExpiresIn = Number(
      this.configService.get('JWT_REFRESH_EXPIRATION'),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
    };
  }

  private async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }
}
