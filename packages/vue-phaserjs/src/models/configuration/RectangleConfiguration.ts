import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface RectangleConfiguration extends ShapeConfiguration {
  height: GameObjects.Rectangle["height"];
  width: GameObjects.Rectangle["width"];
}
