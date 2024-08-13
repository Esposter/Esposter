import type { ShapeConfiguration } from "@/lib/phaser/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export type ArcConfiguration = {
  closePath: GameObjects.Arc["closePath"];
  endAngle: GameObjects.Arc["endAngle"];
  radius: GameObjects.Arc["radius"];
  startAngle: GameObjects.Arc["startAngle"];
} & ShapeConfiguration;
