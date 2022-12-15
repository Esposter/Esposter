import { upgrades } from "@/assets/clicker/data/upgrades";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";

export const clickerRouter = router({
  readUpgrades: rateLimitedProcedure.query(() => upgrades),
});
