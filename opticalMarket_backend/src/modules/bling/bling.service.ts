import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class BlingService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private apiUrl: string;
  private prisma: PrismaClient;

  constructor(private config: ConfigService) {
    this.clientId = this.config.get('BLING_CLIENT_ID') || '';
    this.clientSecret = this.config.get('BLING_CLIENT_SECRET') || '';
    this.redirectUri = this.config.get('BLING_REDIRECT_URI') || '';
    this.apiUrl = this.config.get('BLING_API_URL') || 'https://www.bling.com.br/Api/v3';
    this.prisma = new PrismaClient();
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        `${this.apiUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Store tokens in database
      await this.prisma.blingToken.deleteMany({}); // Keep only one token
      await this.prisma.blingToken.create({
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expiresAt,
          scope: scope || null,
        },
      });

      return { success: true, expiresAt };
    } catch (error) {
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(`Failed to exchange code: ${JSON.stringify(error.response?.data) || error.message}`);
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    const token = await this.prisma.blingToken.findFirst();
    if (!token) {
      throw new Error('No token found');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await axios.post(
        `${this.apiUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.prisma.blingToken.update({
        where: { id: token.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expiresAt,
        },
      });
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get valid access token (refresh if expired)
  async getValidAccessToken(): Promise<string> {
    const token = await this.prisma.blingToken.findFirst();
    if (!token) {
      throw new Error('Bling not connected. Please authenticate first.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (new Date(token.expiresAt).getTime() - Date.now() < 5 * 60 * 1000) {
      await this.refreshAccessToken();
      const refreshedToken = await this.prisma.blingToken.findFirst();
      return refreshedToken!.accessToken;
    }

    return token.accessToken;
  }

  async syncProducts() {
    const accessToken = await this.getValidAccessToken();

    try {
      // Fetch products from Bling API
      const response = await axios.get(`${this.apiUrl}/produtos`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      console.log('Bling API Full Response:', JSON.stringify(response.data, null, 2));
      console.log('Bling API Status:', response.status);
      console.log('Bling API Headers:', response.headers);

      const blingProducts = response.data.data || [];

      if (blingProducts.length === 0) {
        console.log('⚠️ No products found in Bling ERP. The account may be empty or you need to add products first.');
        return {
          success: true,
          data: [],
          total: 0,
          message: 'No products found in Bling ERP',
        };
      }

      // Get or create a default category for synced products
      let defaultCategory = await this.prisma.category.findFirst({
        where: { slug: 'bling-sync' },
      });

      if (!defaultCategory) {
        defaultCategory = await this.prisma.category.create({
          data: {
            name: 'Bling Sync',
            slug: 'bling-sync',
          },
        });
      }

      // Map and save products to database
      const savedProducts = [];
      for (const blingProduct of blingProducts) {
        // Map Bling fields to database schema
        const productData = {
          sku: blingProduct.codigo || '',
          name: blingProduct.nome || '',
          price: blingProduct.preco || 0,
          stock: blingProduct.estoque?.saldoVirtualTotal || 0,
          categoryId: defaultCategory.id,
        };

        // Upsert product (update if exists, create if not)
        const savedProduct = await this.prisma.product.upsert({
          where: { sku: productData.sku },
          update: {
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
            categoryId: productData.categoryId,
          },
          create: productData,
        });

        savedProducts.push(savedProduct);
      }

      return {
        success: true,
        data: savedProducts,
        total: savedProducts.length,
        message: `Successfully synced ${savedProducts.length} products from Bling ERP`,
      };
    } catch (error) {
      console.error('Bling API Error:', error.response?.data);
      throw new Error(`Failed to sync products: ${JSON.stringify(error.response?.data) || error.message}`);
    }
  }

  async createOrder(orderData: any) {
    const accessToken = await this.getValidAccessToken();

    try {
      const response = await axios.post(`${this.apiUrl}/pedidos`, orderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      return { success: true, order: response.data };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.response?.data?.error || error.message}`);
    }
  }

  async isConfigured(): Promise<boolean> {
    if (!this.clientId || !this.clientSecret) {
      return false;
    }
    const token = await this.prisma.blingToken.findFirst();
    return !!token;
  }

  async getConnectionStatus(): Promise<any> {
    const token = await this.prisma.blingToken.findFirst();
    if (!token) {
      return {
        connected: false,
        message: 'Not connected to Bling',
      };
    }

    const isExpired = new Date(token.expiresAt).getTime() < Date.now();
    return {
      connected: true,
      expiresAt: token.expiresAt,
      isExpired: isExpired,
      message: isExpired ? 'Token expired, will refresh on next request' : 'Connected to Bling',
    };
  }
}
