import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { getCommitCount } from "@/util/github/getCommitCount";

const buildVersion = await getCommitCount();

export const appRouter = router({
  buildVersion: rateLimitedProcedure.query(() => buildVersion),
});
