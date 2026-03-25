import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface IsoBoxConfiguration extends ShapeConfiguration {
  fillLeft: GameObjects.IsoBox["fillLeft"];
  fillRight: GameObjects.IsoBox["fillRight"];
  fillTop: GameObjects.IsoBox["fillTop"];
  height: number;
  projection: GameObjects.IsoBox["projection"];
  showLeft: GameObjects.IsoBox["showLeft"];
  showRight: GameObjects.IsoBox["showRight"];
  showTop: GameObjects.IsoBox["showTop"];
  size: number;
}
