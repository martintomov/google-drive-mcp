import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface ApiKeyData {
  apiKey: string;
  name: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  createdAt: Date;
  lastUsed?: Date;
}

@Injectable()
export class AuthService {
  // In-memory storage (in production, use database)
  private apiKeys: Map<string, ApiKeyData> = new Map();

  constructor() {
    // Initialize with a demo API key for testing
    // In production, load from environment variables or database
    const demoKey = process.env.DEMO_API_KEY || 'demo-api-key-12345';
    this.apiKeys.set(demoKey, {
      apiKey: demoKey,
      name: 'Demo Key',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
      createdAt: new Date(),
    });
  }

  /**
   * Validate an API key and return associated data
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyData> {
    const keyData = this.apiKeys.get(apiKey);

    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Update last used timestamp
    keyData.lastUsed = new Date();

    return keyData;
  }

  /**
   * Create a new API key
   */
  async createApiKey(
    name: string,
    googleClientId: string,
    googleClientSecret: string,
    googleRedirectUri: string,
  ): Promise<ApiKeyData> {
    const apiKey = `gd_${randomUUID().replace(/-/g, '')}`;

    const keyData: ApiKeyData = {
      apiKey,
      name,
      googleClientId,
      googleClientSecret,
      googleRedirectUri,
      createdAt: new Date(),
    };

    this.apiKeys.set(apiKey, keyData);

    return keyData;
  }

  /**
   * List all API keys (without secrets)
   */
  async listApiKeys(): Promise<Omit<ApiKeyData, 'googleClientSecret'>[]> {
    return Array.from(this.apiKeys.values()).map(({ googleClientSecret, ...rest }) => rest);
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(apiKey: string): Promise<boolean> {
    return this.apiKeys.delete(apiKey);
  }
}
