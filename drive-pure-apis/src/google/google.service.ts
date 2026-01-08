import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { ApiKeyData } from '../auth/auth.service';

interface TokenStore {
  [apiKey: string]: Credentials;
}

@Injectable()
export class GoogleService {
  // In-memory token storage (in production, use database)
  private tokens: TokenStore = {};

  /**
   * Create an OAuth2 client for an API key
   */
  createOAuth2Client(apiKeyData: ApiKeyData): OAuth2Client {
    return new OAuth2Client(
      apiKeyData.googleClientId,
      apiKeyData.googleClientSecret,
      apiKeyData.googleRedirectUri,
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(apiKeyData: ApiKeyData): string {
    const oauth2Client = this.createOAuth2Client(apiKeyData);

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(apiKeyData: ApiKeyData, code: string): Promise<Credentials> {
    const oauth2Client = this.createOAuth2Client(apiKeyData);
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens for this API key
    this.tokens[apiKeyData.apiKey] = tokens;

    return tokens;
  }

  /**
   * Get stored tokens for an API key
   */
  getTokens(apiKeyData: ApiKeyData): Credentials | null {
    return this.tokens[apiKeyData.apiKey] || null;
  }

  /**
   * Set tokens for an API key (for manual token management)
   */
  setTokens(apiKeyData: ApiKeyData, tokens: Credentials): void {
    this.tokens[apiKeyData.apiKey] = tokens;
  }

  /**
   * Get an authenticated OAuth2 client with automatic token refresh
   */
  async getAuthenticatedClient(apiKeyData: ApiKeyData): Promise<OAuth2Client> {
    const oauth2Client = this.createOAuth2Client(apiKeyData);
    const tokens = this.getTokens(apiKeyData);

    if (!tokens) {
      throw new UnauthorizedException(
        'No Google OAuth tokens found for this API key. Please complete OAuth flow first.',
      );
    }

    oauth2Client.setCredentials(tokens);

    // Set up automatic token refresh
    oauth2Client.on('tokens', (newTokens) => {
      if (newTokens.refresh_token) {
        tokens.refresh_token = newTokens.refresh_token;
      }
      tokens.access_token = newTokens.access_token;
      tokens.expiry_date = newTokens.expiry_date;
      this.tokens[apiKeyData.apiKey] = tokens;
    });

    return oauth2Client;
  }

  /**
   * Get authenticated Google Drive client
   */
  async getDriveClient(apiKeyData: ApiKeyData) {
    const auth = await this.getAuthenticatedClient(apiKeyData);
    return google.drive({ version: 'v3', auth });
  }

  /**
   * Get authenticated Google Docs client
   */
  async getDocsClient(apiKeyData: ApiKeyData) {
    const auth = await this.getAuthenticatedClient(apiKeyData);
    return google.docs({ version: 'v1', auth });
  }

  /**
   * Get authenticated Google Sheets client
   */
  async getSheetsClient(apiKeyData: ApiKeyData) {
    const auth = await this.getAuthenticatedClient(apiKeyData);
    return google.sheets({ version: 'v4', auth });
  }

  /**
   * Get authenticated Google Slides client
   */
  async getSlidesClient(apiKeyData: ApiKeyData) {
    const auth = await this.getAuthenticatedClient(apiKeyData);
    return google.slides({ version: 'v1', auth });
  }

  /**
   * Clear tokens for an API key (logout)
   */
  clearTokens(apiKeyData: ApiKeyData): void {
    delete this.tokens[apiKeyData.apiKey];
  }
}
