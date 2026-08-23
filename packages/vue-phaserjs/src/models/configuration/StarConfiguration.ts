import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface StarConfiguration
  extends Pick<GameObjects.Star, "innerRadius" | "outerRadius" | "points">, ShapeConfiguration {}
