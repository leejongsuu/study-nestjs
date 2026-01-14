// main.ts

// Nest.js 애플리케이션 인스턴스를 생성하는 데 필요한 유틸리티를 가져옵니다.
import { NestFactory, Reflector } from '@nestjs/core';
// Swagger 모듈과 문서 설정을 위한 빌더를 가져옵니다.
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// 애플리케이션의 루트 모듈을 가져옵니다.
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';

// 비동기 함수로 애플리케이션의 초기 설정을 시작합니다.
async function bootstrap() {
  // Nest 애플리케이션 인스턴스를 생성합니다.
  const app = await NestFactory.create(AppModule);

  // 전역 유효성 검사 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 있으면 요청 자체를 막음
      transform: true, // 요청 데이터를 DTO의 타입으로 자동 변환
    }),
  );

  // 전역 필터 등록
  // app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // 전역 인터셉터 등록
  app.useGlobalInterceptors(new SuccessInterceptor());

  // 전역 JWT Guard 설정
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Swagger 설정 부분
  // 1. DocumentBuilder를 사용하여 Swagger 문서의 기본 정보를 설정합니다.
  const config = new DocumentBuilder()
    // 문서 페이지의 제목을 설정합니다.
    .setTitle('Nest.js API 예시')
    // 문서에 대한 간략한 설명을 추가합니다. (문서 상단에 표시)
    .setDescription('Nest.js를 사용한 백엔드 API 설명')
    // API의 버전을 설정합니다.
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'header',
      },
      'access-token',
    )

    // 설정을 완료하고 빌더 객체를 생성합니다.
    .build();

  // 2. Swagger 문서 생성 함수 (Factory) 정의
  // SwaggerModule.createDocument()는 애플리케이션의 모든 라우트, DTO 등의 메타데이터를
  // 읽어 OpenAPI Specification(OAS) JSON 객체를 생성하는 함수입니다.
  // setup() 함수가 문서 객체 대신 문서를 생성하는 팩토리를 받도록 정의합니다.
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // 3. Swagger UI 엔드포인트 설정
  // 'api' 경로에 Swagger UI 인터페이스를 설정합니다.
  // 예: http://localhost:3000/api 로 접속하여 문서를 볼 수 있습니다.
  // 두 번째 인자(app)는 Nest 애플리케이션 인스턴스입니다.
  // 세 번째 인자(documentFactory)는 위에서 정의한 문서 생성 함수입니다.
  SwaggerModule.setup('api', app, documentFactory);

  // 환경 변수 PORT가 있다면 해당 포트를 사용하고, 없다면 기본값 3000번 포트로 서버를 실행합니다.
  await app.listen(process.env.PORT ?? 3000);
}

// 애플리케이션을 시작하는 함수를 호출합니다.
void bootstrap();
