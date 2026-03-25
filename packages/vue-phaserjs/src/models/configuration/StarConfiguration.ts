import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface StarConfiguration extends ShapeConfiguration {
  innerRadius: GameObjects.Star["innerRadius"];
  outerRadius: GameObjects.Star["outerRadius"];
  points: GameObjects.Star["points"];
}
