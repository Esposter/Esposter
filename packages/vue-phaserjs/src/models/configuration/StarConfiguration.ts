import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface StarConfiguration
  extends Pick<GameObjects.Star, "innerRadius" | "outerRadius" | "points">, ShapeConfiguration {}
