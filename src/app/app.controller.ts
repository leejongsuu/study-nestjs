import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('/health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
