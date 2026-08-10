import { dayjs } from "#shared/services/dayjs";

// One sliding window for every limiter, so a budget is always read as "N per this window" and a lockout is
// Always "the rest of one window" rather than a second number nobody can compare against
export const RATE_LIMITER_DURATION_SECONDS = dayjs.duration(1, "minute").asSeconds();
