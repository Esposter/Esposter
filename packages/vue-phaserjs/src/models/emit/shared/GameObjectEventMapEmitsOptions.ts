import type { GameObjectEventMap } from "#src/services/emit/GameObjectEventMap";
import type { Types } from "phaser";

export type GameObjectEventMapEmitsOptions = {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
};
