import { HttpModuleOptionsFactory, Injectable, HttpModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Http 设置服务类
 */
@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    const baseURL = process.env.BACKEND_BASE_URL || this.configService.get<string>('server.url');
    return {
      baseURL,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };
  }
}
