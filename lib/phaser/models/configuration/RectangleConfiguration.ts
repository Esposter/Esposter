import { type GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import { type ShapeConfiguration } from "@/lib/phaser/models/configuration/shared/ShapeConfiguration";
import { type GameObjects } from "phaser";

export type RectangleConfiguration = ShapeConfiguration &
  GlobalConfiguration & {
    width: GameObjects.Rectangle["width"];
    height: GameObjects.Rectangle["height"];
  };
