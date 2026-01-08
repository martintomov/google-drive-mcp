import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiKeyData } from '../auth.service';

/**
 * Decorator to extract API key data from the request
 * Use after AuthGuard has validated the key
 */
export const ApiKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ApiKeyData => {
    const request = ctx.switchToHttp().getRequest();
    return request.apiKeyData;
  },
);
