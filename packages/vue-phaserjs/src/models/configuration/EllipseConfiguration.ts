import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface EllipseConfiguration
  extends Pick<GameObjects.Ellipse, "height" | "smoothness" | "width">, ShapeConfiguration {}
