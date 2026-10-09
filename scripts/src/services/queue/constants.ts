// The pushes `pnpm ai:queue:push` makes before it gives up on a remote that keeps moving under it. Each attempt fetches
// And replays again, so a few are enough: the collector rewrites the queue once per window, not once per push
export const MAX_PUSH_ATTEMPTS = 3;
