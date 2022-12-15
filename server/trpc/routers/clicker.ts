import { buildings } from "@/assets/clicker/data/buildings";
import { upgrades } from "@/assets/clicker/data/upgrades";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";

export const clickerRouter = router({
  readUpgrades: rateLimitedProcedure.query(() => upgrades),
  readBuildings: rateLimitedProcedure.query(() => buildings),
});
