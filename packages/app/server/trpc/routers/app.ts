import { getCommitCount } from "#shared/util/github/getCommitCount";
import { router } from "@@/server/trpc";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";

export const appRouter = router({
  buildVersion: rateLimitedProcedure.query(() => getCommitCount()),
});
