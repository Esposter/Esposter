import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface PolygonConfiguration extends ShapeConfiguration {
  points: Parameters<GameObjects.Polygon["setTo"]>[0];
}
