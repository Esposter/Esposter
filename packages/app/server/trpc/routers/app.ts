import { publicProcedure, router } from "@/server/trpc";

import { getCommitCount } from "@/shared/util/github/getCommitCount";

export const appRouter = router({
  buildVersion: publicProcedure.query(() => getCommitCount()),
});
