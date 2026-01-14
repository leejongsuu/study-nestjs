import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch 데코레이터는 이 필터가 'HttpException' 타입의 에러만 잡겠다는 뜻입니다.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 1. 실행 컨텍스트에서 HTTP 관련 객체를 가져옵니다.
    const response = ctx.getResponse<Response>(); // 2. Express의 Response 객체
    const request = ctx.getRequest<Request>(); // 3. Express의 Request 객체
    const status = exception.getStatus(); // 4. 예외가 발생한 상태 코드 (예: 400, 404)

    // exception에서 message 부분을 추출합니다.
    const errorResponse = exception.getResponse();
    const message =
      typeof errorResponse === 'object' &&
      errorResponse !== null &&
      'message' in errorResponse
        ? (errorResponse as Record<string, unknown>).message
        : errorResponse;

    this.logger.warn(`Http Exception: ${status} - ${JSON.stringify(message)}`);

    // 5. 우리가 원하는 형태로 응답 JSON을 조립합니다.
    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
      message: message,
    });
  }
}
