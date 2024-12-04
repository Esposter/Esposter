import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export type ArcConfiguration = ShapeConfiguration & {
  closePath: GameObjects.Arc["closePath"];
  endAngle: GameObjects.Arc["endAngle"];
  radius: GameObjects.Arc["radius"];
  startAngle: GameObjects.Arc["startAngle"];
};
