import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface TriangleConfiguration extends ShapeConfiguration {
  to: Parameters<GameObjects.Triangle["setTo"]>;
}
