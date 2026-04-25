import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface ArcConfiguration
  extends Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle">, ShapeConfiguration {}
