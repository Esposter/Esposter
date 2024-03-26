import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { ShapeConfiguration } from "@/lib/phaser/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export type ArcConfiguration = {
  radius: GameObjects.Arc["radius"];
  closePath: GameObjects.Arc["closePath"];
  startAngle: GameObjects.Arc["startAngle"];
  endAngle: GameObjects.Arc["endAngle"];
} & ShapeConfiguration &
  GlobalConfiguration;
