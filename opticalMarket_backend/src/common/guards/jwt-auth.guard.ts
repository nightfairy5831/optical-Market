import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('JWT Guard - Auth header:', authHeader ? 'EXISTS' : 'MISSING');

    if (!authHeader) {
      console.log('JWT Guard - Error: No authorization header');
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      console.log('JWT Guard - Error: Invalid format, type:', type);
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      console.log('JWT Guard - Success, user:', payload.email || payload.sub);
      request.user = payload;
      return true;
    } catch (error) {
      console.log('JWT Guard - Error: Invalid token', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
