import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BoardModule } from 'src/board/board.module';
import { validate } from 'src/common/config/env.validation';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { InternalServerErrorFilter } from 'src/common/filters/internal-server-error.filter';
import { UserModule } from 'src/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    UserModule,
    BoardModule,
    AuthModule,
    // 1. ConfigModule 설정: .env 파일 로드
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 .env 설정 사용
      validate,
      // envFilePath: ['.env.dev', '.env'], // 필요에 따라 환경 파일 지정
    }),

    // 2. TypeOrmModule 비동기 설정: ConfigService의 환경 변수 주입
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigService를 가져오기 위해 ConfigModule 주입
      inject: [ConfigService], // ConfigService 인스턴스를 주입받음

      // 실제 연결 설정을 수행하는 팩토리 함수
      useFactory: (config: ConfigService) => ({
        type: config.get<string>('DB_TYPE') as 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),

        // 엔티티 로드 설정
        autoLoadEntities: true,

        // 데이터베이스 스키마 동기화 (개발 시 편리, **운영 시 절대 금지**)
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
