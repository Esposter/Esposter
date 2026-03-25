import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface EllipseConfiguration extends ShapeConfiguration {
  height: number;
  smoothness: GameObjects.Ellipse["smoothness"];
  width: number;
}
