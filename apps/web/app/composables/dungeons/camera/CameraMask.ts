import type { Filters, GameObjects } from "phaser";

export interface CameraMask {
  graphics: GameObjects.Graphics;
  mask: Filters.Mask;
}
