import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
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
