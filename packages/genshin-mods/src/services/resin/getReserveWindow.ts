import type { SessionRateLimit } from "claude-code";

import type { ReserveWindow } from "../../../types";

import { RateLimitKindUsageWindowMap } from "./RateLimitKindUsageWindowMap";

// Each window past one of its lines, with the line it has passed and the time it resets, five-hour before weekly. A
// Window the engine gives no reset time for is skipped, since the reserve is named by that time and lifts at it
// The first wind-down names the reserve, and only when none is past its wind-down does the first maintenance tier
export const getReserveWindow = (rateLimits: SessionRateLimit[]): ReserveWindow | undefined => {
  const reserveWindows: ReserveWindow[] = [];
  for (const [kind, { maintenancePercentage, name, windDownPercentage }] of Object.entries(
    RateLimitKindUsageWindowMap,
  )) {
    const rateLimit = rateLimits.find((limit) => limit.kind === kind);
    if (rateLimit?.resetsAt === undefined) continue;
    const isWindDown = rateLimit.percentUsed >= windDownPercentage;
    const percentage = isWindDown ? windDownPercentage : maintenancePercentage;
    if (rateLimit.percentUsed < percentage) continue;
    reserveWindows.push({ isWindDown, name, percentage, resetsAt: rateLimit.resetsAt });
  }

  return reserveWindows.find(({ isWindDown }) => isWindDown) ?? reserveWindows[0];
};
