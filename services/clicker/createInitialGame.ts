import type { Game } from "@/models/clicker/Game";

export const createInitialGame = (): Game => ({
  noPoints: 0,
  boughtUpgrades: [],
  boughtBuildings: [],
  createdAt: new Date(),
});
