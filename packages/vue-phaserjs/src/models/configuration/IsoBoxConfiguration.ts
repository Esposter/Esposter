import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface IsoBoxConfiguration
  extends
    Pick<
      GameObjects.IsoBox,
      "fillLeft" | "fillRight" | "fillTop" | "projection" | "showLeft" | "showRight" | "showTop"
    >,
    ShapeConfiguration {
  height: number;
  size: number;
}
