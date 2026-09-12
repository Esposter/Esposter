import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { getAuthedProcedure } from "@@/server/trpc/procedure/getAuthedProcedure";

export const standardAuthedProcedure = getAuthedProcedure(RateLimiterType.Standard);
