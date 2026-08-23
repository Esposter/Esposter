import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { GameObjects } from "phaser";

export interface RectangleConfiguration extends Pick<GameObjects.Rectangle, "height" | "width">, ShapeConfiguration {}
