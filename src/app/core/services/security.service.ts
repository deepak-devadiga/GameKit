import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly configService = inject(ConfigService);

  computeChecksum(payload: string): string {
    const salt = this.configService.appConfig()?.security.hmacSalt ?? 'gk-default-salt';
    const input = `${salt}:${payload}:${salt}`;
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  wrapSignedPayload<T>(data: T): string {
    const json = JSON.stringify(data);
    const checksum = this.computeChecksum(json);
    return JSON.stringify({ payload: json, checksum, ts: Date.now() });
  }

  unwrapSignedPayload<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { payload: string; checksum: string; ts: number };
      const verifyEnabled =
        this.configService.appConfig()?.security.enableChecksumValidation ?? true;
      if (verifyEnabled) {
        const expected = this.computeChecksum(parsed.payload);
        if (expected !== parsed.checksum) {
          console.warn('[GameKit Security] Tampered save state rejected.');
          return null;
        }
      }
      return JSON.parse(parsed.payload) as T;
    } catch {
      return null;
    }
  }
}

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    setHeaders: {
      'X-Requested-With': 'GameKit-Angular-22',
      'Cache-Control': 'no-cache',
    },
  });
  return next(secureReq);
};
