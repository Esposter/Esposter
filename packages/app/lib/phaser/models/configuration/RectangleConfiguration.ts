import type { ShapeConfiguration } from "@/lib/phaser/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export type RectangleConfiguration = {
  height: GameObjects.Rectangle["height"];
  width: GameObjects.Rectangle["width"];
} & ShapeConfiguration;
