import { RateLimiterRes } from "rate-limiter-flexible";

// `rate-limiter-flexible` rejects an over-budget consume with a `RateLimiterRes`, which is not an `Error` and
// Carries no `message`, so every neverthrow boundary in this repo wraps it (`toAppError` → `new Error(String(
// Error), { cause: error })`). A bare `error instanceof RateLimiterRes` at the call site therefore never
// Matches, and the branch meant to answer 429 falls through to the one that answers 500. Both forms are checked
// Here, once, so no consumer has to know which side of a `getResultAsync` it is reading the rejection on.
export const checkIsRateLimitExceeded = (error: unknown): boolean =>
  error instanceof RateLimiterRes || (error instanceof Error && error.cause instanceof RateLimiterRes);
