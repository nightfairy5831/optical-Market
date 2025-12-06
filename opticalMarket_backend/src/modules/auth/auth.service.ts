import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Only allow CUSTOMER or SELLER roles during registration
    const allowedRoles: UserRole[] = [UserRole.CUSTOMER, UserRole.SELLER];
    const userRole: UserRole = data.role && allowedRoles.includes(data.role as UserRole)
      ? (data.role as UserRole)
      : UserRole.CUSTOMER;

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: userRole,
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
    };
  }
}
