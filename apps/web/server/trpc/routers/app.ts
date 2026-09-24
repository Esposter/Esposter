import { getCommitCount } from "@@/server/services/app/getCommitCount";
import { router } from "@@/server/trpc";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";

export const appRouter = router({
  readBuildVersion: standardRateLimitedProcedure.query<number>(() => getCommitCount()),
});
