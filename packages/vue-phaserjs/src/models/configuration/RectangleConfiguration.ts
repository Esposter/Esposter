import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface RectangleConfiguration extends Pick<GameObjects.Rectangle, "height" | "width">, ShapeConfiguration {}
