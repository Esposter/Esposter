import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { Curves, GameObjects } from "phaser";

export interface CurveConfiguration extends ShapeConfiguration {
  curve: Curves.Curve;
  smoothness: GameObjects.Curve["smoothness"];
}
