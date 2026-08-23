import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface ArcConfiguration
  extends Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle">, ShapeConfiguration {}
