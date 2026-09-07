import type { AnyProcedureBuilder } from "@trpc/server/unstable-core-do-not-import";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { slowAuthedProcedure } from "@@/server/trpc/procedure/slowAuthedProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";

export const AuthedProcedureMap = {
  [RateLimiterType.Slow]: slowAuthedProcedure,
  [RateLimiterType.Standard]: standardAuthedProcedure,
} as const satisfies Record<RateLimiterType, AnyProcedureBuilder>;
