import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter Module', () => {
  beforeEach(() => {
    // Clear state or use dynamic IPs
  });

  it('permits requests within quota', () => {
    const ip = `test-ip-${Date.now()}`;
    const res1 = checkRateLimit(ip, { intervalMs: 10000, maxRequests: 2 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(ip, { intervalMs: 10000, maxRequests: 2 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it('blocks requests exceeding maximum allowance', () => {
    const ip = `blocked-ip-${Date.now()}`;
    checkRateLimit(ip, { intervalMs: 10000, maxRequests: 1 });
    const blockedRes = checkRateLimit(ip, { intervalMs: 10000, maxRequests: 1 });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});
