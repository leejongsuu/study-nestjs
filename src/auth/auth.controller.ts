import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './types/authenticated-user.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Tokens } from './types/token.type';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.signUp(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @ApiBearerAuth('access-token') // 스웨거에서 헤더 적용하려면 사용해야 함
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: AuthenticatedUser & { refreshToken: string },
  ): Promise<Tokens> {
    return this.authService.refreshAccessToken(user.id, user.refreshToken);
  }

  @Post('logout')
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.authService.logout(user.id);
  }
}
