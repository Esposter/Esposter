import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { Curves, GameObjects } from "phaser";

export interface CurveConfiguration extends Pick<GameObjects.Curve, "smoothness">, ShapeConfiguration {
  curve: Curves.Curve;
}
