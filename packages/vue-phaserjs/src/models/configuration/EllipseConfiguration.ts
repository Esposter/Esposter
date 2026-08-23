import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface EllipseConfiguration
  extends Pick<GameObjects.Ellipse, "height" | "smoothness" | "width">, ShapeConfiguration {}
