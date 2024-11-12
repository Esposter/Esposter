import { publicProcedure, router } from "@/server/trpc";
import { getCommitCount } from "@/util/github/getCommitCount";

export const appRouter = router({
  buildVersion: publicProcedure.query(() => getCommitCount()),
});
