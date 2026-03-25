import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface LineConfiguration extends ShapeConfiguration {
  lineWidth: GameObjects.Line["lineWidth"];
  to: Parameters<GameObjects.Line["setTo"]>;
}
