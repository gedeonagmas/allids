import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // Ensure cookies object exists
    if (!request.cookies) {
      request.cookies = {};
    }

    // Parse cookie header manually if cookie-parser hasn't done it
    if (!request.cookies['access_token'] && request.headers.cookie) {
      const cookies = request.headers.cookie.split(';').reduce((acc: any, cookie: string) => {
        const parts = cookie.trim().split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});

      if (cookies['access_token']) {
        request.cookies['access_token'] = cookies['access_token'];
      }
    }

    // If still no token, try Authorization header
    if (!request.cookies['access_token'] && request.headers?.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        request.cookies['access_token'] = authHeader.substring(7);
      }
    }

    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result.catch(err => {
        console.warn(`JWT Auth Failed: ${err.message}`);
        throw err;
      });
    }

    return result;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.warn('Authentication failed:', {
        error: err?.message,
        info: info?.message,
        reason: info?.name
      });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

