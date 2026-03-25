import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface IsoTriangleConfiguration extends ShapeConfiguration {
  fillLeft: GameObjects.IsoTriangle["fillLeft"];
  fillRight: GameObjects.IsoTriangle["fillRight"];
  fillTop: GameObjects.IsoTriangle["fillTop"];
  height: number;
  isReversed: GameObjects.IsoTriangle["isReversed"];
  projection: GameObjects.IsoTriangle["projection"];
  showLeft: GameObjects.IsoTriangle["showLeft"];
  showRight: GameObjects.IsoTriangle["showRight"];
  showTop: GameObjects.IsoTriangle["showTop"];
  size: number;
}
