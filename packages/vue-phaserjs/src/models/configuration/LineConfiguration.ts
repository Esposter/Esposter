import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface LineConfiguration extends Pick<GameObjects.Line, "lineWidth">, ShapeConfiguration {
  to: Parameters<GameObjects.Line["setTo"]>;
}
