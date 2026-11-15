import { getCommitCount } from "#server/services/app/getCommitCount";
import { router } from "#server/trpc/index";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";

export const appRouter = router({
  readBuildVersion: standardRateLimitedProcedure
    .meta({ staticReason: "The commit count is fixed when the Worker is built, so no write changes it" })
    .query<number>(() => getCommitCount()),
});
