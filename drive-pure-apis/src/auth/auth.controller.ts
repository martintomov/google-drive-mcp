import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleService } from '../google/google.service';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleService: GoogleService,
  ) {}

  @Get('oauth/start')
  @Public()
  @ApiOperation({ summary: 'Start OAuth flow for demo API key' })
  @ApiQuery({ name: 'apiKey', required: false, description: 'API key to authorize (defaults to demo key)' })
  async startOAuth(@Query('apiKey') apiKey: string, @Res() res: Response) {
    // Use demo key if not provided
    const keyToAuth = apiKey || process.env.DEMO_API_KEY || 'demo-api-key-12345';

    try {
      const apiKeyData = await this.authService.validateApiKey(keyToAuth);
      const authUrl = this.googleService.getAuthorizationUrl(apiKeyData);

      // Redirect to Google OAuth
      return res.redirect(authUrl);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Invalid API key',
        message: error.message,
      });
    }
  }

  @Get('oauth/callback')
  @Public()
  @ApiOperation({ summary: 'OAuth callback endpoint' })
  async oauthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'No authorization code received',
      });
    }

    try {
      // Use demo API key for now (in production, use state parameter to identify the key)
      const apiKey = process.env.DEMO_API_KEY || 'demo-api-key-12345';
      const apiKeyData = await this.authService.validateApiKey(apiKey);

      // Exchange code for tokens
      const tokens = await this.googleService.exchangeCode(apiKeyData, code);

      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>OAuth Success</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
              }
              .success {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .success h1 {
                color: #4CAF50;
                margin-top: 0;
              }
              .info {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
              }
              code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ OAuth Authorization Successful!</h1>
              <p>Your API key has been authorized with Google Drive.</p>
              <div class="info">
                <strong>API Key:</strong> <code>${apiKey}</code><br><br>
                <strong>Access Token:</strong> <code>${tokens.access_token?.substring(0, 20)}...</code><br><br>
                <strong>Status:</strong> Ready to use Google Drive APIs
              </div>
              <p style="margin-top: 30px;">
                You can now close this window and make API calls using your API key.
              </p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to exchange authorization code',
        message: error.message,
      });
    }
  }

  @Get('oauth/status')
  @Public()
  @ApiOperation({ summary: 'Check OAuth status for an API key' })
  @ApiQuery({ name: 'apiKey', required: false })
  async checkStatus(@Query('apiKey') apiKey: string) {
    const keyToCheck = apiKey || process.env.DEMO_API_KEY || 'demo-api-key-12345';

    try {
      const apiKeyData = await this.authService.validateApiKey(keyToCheck);
      const tokens = this.googleService.getTokens(apiKeyData);

      return {
        apiKey: keyToCheck,
        hasTokens: !!tokens,
        tokenInfo: tokens ? {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiryDate: tokens.expiry_date,
        } : null,
      };
    } catch (error) {
      return {
        error: 'Invalid API key',
        message: error.message,
      };
    }
  }
}
