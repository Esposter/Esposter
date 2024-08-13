import { publicProcedure, router } from "@/server/trpc";
import { getCommitCount } from "@/util/github/getCommitCount";

const buildVersion = await getCommitCount();

export const appRouter = router({
  buildVersion: publicProcedure.query(() => buildVersion),
});
