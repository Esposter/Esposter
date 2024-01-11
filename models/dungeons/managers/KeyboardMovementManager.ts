import { MovementManager } from "@/models/dungeons/managers/MovementManager";
import { type GridEngine } from "grid-engine";
import { type Scene } from "phaser";

export class KeyboardMovementManager extends MovementManager {
  constructor(gridEngine: GridEngine, scene: Scene) {
    super(gridEngine, scene.input.keyboard!.createCursorKeys());
  }
}
