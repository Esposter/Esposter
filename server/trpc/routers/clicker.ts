import { buildings } from "@/assets/clicker/data/buildings";
import { cursorUpgrades } from "@/assets/clicker/data/upgrades/cursor";
import { grandmaUpgrades } from "@/assets/clicker/data/upgrades/grandma";
import { Upgrade } from "@/models/clicker/Upgrade";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";

export const clickerRouter = router({
  readUpgrades: rateLimitedProcedure.query<Upgrade[]>(() => [...cursorUpgrades, ...grandmaUpgrades] as Upgrade[]),
  readBuildings: rateLimitedProcedure.query(() => buildings),
});
