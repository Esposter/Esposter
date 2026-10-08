import type { SessionRateLimit } from "claude-code";

import type { ReserveWindow } from "../../../types";

import { USAGE_RESERVE_PERCENTAGE } from "../constants";

// The windows a reserve is read off, five-hour before weekly, so the five-hour one is the one named when both have passed
// The line
const RateLimitKindWindowNameMap: Record<string, string> = { five_hour: "five-hour", seven_day: "weekly" };

// The first window at or past the line, with the time it resets. A window the engine gives no reset time for is skipped
// Too, since the reserve is named by that time and lifts at it
export const getReserveWindow = (rateLimits: SessionRateLimit[]): ReserveWindow | undefined => {
  for (const [kind, name] of Object.entries(RateLimitKindWindowNameMap)) {
    const rateLimit = rateLimits.find((limit) => limit.kind === kind);
    if (rateLimit?.resetsAt !== undefined && rateLimit.percentUsed >= USAGE_RESERVE_PERCENTAGE)
      return { name, resetsAt: rateLimit.resetsAt };
  }

  return undefined;
};
