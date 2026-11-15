export const RateLimiterType = { Slow: "Slow", Standard: "Standard" } as const;
export type RateLimiterType = (typeof RateLimiterType)[keyof typeof RateLimiterType];
