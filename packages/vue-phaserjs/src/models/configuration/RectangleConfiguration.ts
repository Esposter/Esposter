import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export type RectangleConfiguration = ShapeConfiguration & {
  height: GameObjects.Rectangle["height"];
  width: GameObjects.Rectangle["width"];
};
