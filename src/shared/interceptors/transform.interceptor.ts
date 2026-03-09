import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T> | any
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | any> {
    return next.handle().pipe(
      map((data) => {
        // No transformar respuestas si son streams/archivos (ej. descargas de PDF)
        if (data instanceof StreamableFile) {
          return data;
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
