// One sliding window for every limiter, so a budget is always read as "N per this window" and a lockout is
// Always "the rest of one window" rather than a second number nobody can compare against
export const RATE_LIMITER_DURATION_SECONDS = Temporal.Duration.from({ minutes: 1 }).total("seconds");

// An authed caller is keyed on its user id, which is available whether or not an address is, so only the
// Anonymous key depends on the ingress header. Bypassing both would leave every signed-in request unbudgeted
// On a deployment whose header never arrives, so the bypass is the anonymous case alone — and it is expected
// Locally, where a production build serves requests that reach it without one. Written once because both the
// TRPC middleware and the asset route reach the same dead end and a reader grepping the log needs one hit
export const RATE_LIMITER_BYPASS_LOG_MESSAGE =
  "[RateLimiter] Could not determine IP address for an anonymous request. Bypassing middleware... This is expected for local production builds.";
