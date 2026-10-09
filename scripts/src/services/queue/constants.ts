// The pushes `pnpm ai:queue:push` makes before it gives up on a remote that keeps moving under it. Each attempt fetches
// And replays again. With many machines pushing, a push loses its race routinely, so the attempts are many and each waits
export const MAX_PUSH_ATTEMPTS = 8;
// The wait before a retry is drawn at random up to an exponential bound: base doubling each attempt, capped, so the
// Machines that lost one race do not all retry at the same moment (full jitter)
export const PUSH_RETRY_BASE_MILLISECONDS: number = Temporal.Duration.from({ seconds: 2 }).total("milliseconds");
export const PUSH_RETRY_CAP_MILLISECONDS: number = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");
