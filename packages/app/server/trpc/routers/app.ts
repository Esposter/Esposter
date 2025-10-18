import { getCommitCount } from "#shared/util/github/getCommitCount";
import { router } from "@@/server/trpc";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";

export const appRouter = router({
  buildVersion: standardRateLimitedProcedure.query(() => getCommitCount()),
});
