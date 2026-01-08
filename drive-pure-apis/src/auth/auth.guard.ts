import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Extract API key from header or query parameter
    const apiKey =
      request.headers['x-api-key'] ||
      request.query.api_key;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required. Provide it via X-API-Key header or api_key query parameter.');
    }

    try {
      // Validate API key and attach key data to request
      const keyData = await this.authService.validateApiKey(apiKey as string);
      request.apiKeyData = keyData;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
