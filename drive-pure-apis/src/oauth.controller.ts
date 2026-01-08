import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth/auth.service';
import { GoogleService } from './google/google.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('OAuth')
@ApiExcludeController()
@Controller()
export class OAuthController {
  constructor(
    private authService: AuthService,
    private googleService: GoogleService,
  ) {}

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
      // Use demo API key for now
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .success {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              }
              .success h1 {
                color: #4CAF50;
                margin-top: 0;
                font-size: 28px;
              }
              .checkmark {
                font-size: 48px;
                text-align: center;
                margin-bottom: 20px;
              }
              .info {
                background: #f0f7ff;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
                border-left: 4px solid #2196F3;
              }
              .info strong {
                color: #1976D2;
              }
              code {
                background: #f5f5f5;
                padding: 3px 8px;
                border-radius: 4px;
                font-family: 'Monaco', 'Courier New', monospace;
                font-size: 13px;
                color: #d32f2f;
              }
              .next-steps {
                background: #fff3cd;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
                border-left: 4px solid #ffc107;
              }
              .next-steps h3 {
                margin-top: 0;
                color: #856404;
              }
              .command {
                background: #263238;
                color: #aed581;
                padding: 15px;
                border-radius: 6px;
                font-family: monospace;
                margin-top: 10px;
                overflow-x: auto;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="success">
              <div class="checkmark">✅</div>
              <h1>Authorization Successful!</h1>
              <p>Your API key has been authorized with Google Drive. You can now upload files and access all Google Workspace APIs.</p>

              <div class="info">
                <strong>API Key:</strong><br>
                <code>${apiKey}</code><br><br>

                <strong>Status:</strong> ✓ Authenticated<br><br>

                <strong>Scopes Granted:</strong><br>
                • Google Drive<br>
                • Google Docs<br>
                • Google Sheets<br>
                • Google Slides
              </div>

              <div class="next-steps">
                <h3>📤 Upload Your PDF</h3>
                <p>Run this command to upload your PDF:</p>
                <div class="command">
curl -X POST http://localhost:3110/files/upload-path \\<br>
  -H "X-API-Key: <key-here>" \\<br>
  -H "Content-Type: application/json" \\<br>
  -d '{"filePath": "path-here"}'
                </div>
              </div>

              <p style="margin-top: 30px; text-align: center; color: #666;">
                You can close this window and return to your terminal.
              </p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
              }
              .error {
                background: #ffebee;
                padding: 30px;
                border-radius: 8px;
                border-left: 4px solid #f44336;
              }
              .error h1 {
                color: #c62828;
                margin-top: 0;
              }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Authorization Failed</h1>
              <p><strong>Error:</strong> ${error.message}</p>
              <p>Please try again by visiting: <a href="http://localhost:3110/auth/oauth/start">Start OAuth Flow</a></p>
            </div>
          </body>
        </html>
      `);
    }
  }
}
