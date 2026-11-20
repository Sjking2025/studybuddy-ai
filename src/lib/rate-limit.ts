export interface RateLimitConfig {
  intervalMs: number;
  maxRequests: number;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Periodically purges expired entries to prevent unbounded memory growth.
 */
function cleanupExpiredRecords(now: number) {
  if (memoryStore.size > 1000) {
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }
}

/**
 * In-memory sliding-window rate limiter for edge & API route security.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { intervalMs: 60 * 1000, maxRequests: 20 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = memoryStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + config.intervalMs,
    };
    memoryStore.set(identifier, newRecord);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
