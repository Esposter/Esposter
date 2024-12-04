import { getCommitCount } from "#shared/util/github/getCommitCount";
import { publicProcedure, router } from "@@/server/trpc";

export const appRouter = router({
  buildVersion: publicProcedure.query(() => getCommitCount()),
});
