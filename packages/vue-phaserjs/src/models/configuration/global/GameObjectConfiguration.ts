import type { GameObjects } from "phaser";

export interface GameObjectConfiguration extends Pick<GameObjects.GameObject, "active"> {}
