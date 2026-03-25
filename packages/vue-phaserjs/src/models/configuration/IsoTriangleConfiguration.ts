import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface IsoTriangleConfiguration
  extends
    Pick<
      GameObjects.IsoTriangle,
      "fillLeft" | "fillRight" | "fillTop" | "isReversed" | "projection" | "showLeft" | "showRight" | "showTop"
    >,
    ShapeConfiguration {
  height: number;
  size: number;
}
