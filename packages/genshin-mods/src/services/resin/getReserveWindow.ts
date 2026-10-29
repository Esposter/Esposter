import type { SessionRateLimit } from "claude-code";

import type { ReserveWindow } from "../../../types";

import { PACE_FLOOR_PERCENTAGE } from "../constants";
import { RateLimitKindUsageWindowMap } from "./RateLimitKindUsageWindowMap";

// Each window a reserve is read off, five-hour before weekly, so the five-hour one is the one named when both qualify. A
// Window is read once past its maintenance line, or once half of its allowance is spent ahead of an even pace, the share
// Of its length that has elapsed. A window the engine gives no reset time for is skipped, since the reserve is named by
// That time and lifts at it
export const getReserveWindow = (rateLimits: SessionRateLimit[], now: number): ReserveWindow | undefined => {
  const reserveWindows: ReserveWindow[] = [];
  for (const [kind, { durationMs, maintenancePercentage, name }] of Object.entries(RateLimitKindUsageWindowMap)) {
    const rateLimit = rateLimits.find((limit) => limit.kind === kind);
    if (rateLimit?.resetsAt === undefined) continue;
    const isPastMaintenance = rateLimit.percentUsed >= maintenancePercentage;
    const elapsedPercentage = 100 * (1 - (Date.parse(rateLimit.resetsAt) - now) / durationMs);
    const isAheadOfPace =
      !isPastMaintenance && rateLimit.percentUsed >= PACE_FLOOR_PERCENTAGE && rateLimit.percentUsed > elapsedPercentage;
    if (!isPastMaintenance && !isAheadOfPace) continue;
    const percentage = isPastMaintenance ? maintenancePercentage : PACE_FLOOR_PERCENTAGE;
    reserveWindows.push({ isAheadOfPace, name, percentage, resetsAt: rateLimit.resetsAt });
  }

  return reserveWindows[0];
};
