import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface LineConfiguration extends Pick<GameObjects.Line, "lineWidth">, ShapeConfiguration {
  to: Parameters<GameObjects.Line["setTo"]>;
}
