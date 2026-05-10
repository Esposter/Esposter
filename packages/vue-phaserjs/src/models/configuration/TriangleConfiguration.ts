import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface TriangleConfiguration extends ShapeConfiguration {
  to: Parameters<GameObjects.Triangle["setTo"]>;
}
