import type { GameObjectConfiguration } from "@/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventMap } from "@/util/emit/GameObjectEventMap";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";
import type { Types } from "phaser";
// Phaser-specific game object events, so the setter map doesn't implement them; we just redirect
// our vue events to the equivalent phaser event.
export type GameObjectEventEmitsOptions = {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
} & {
  [P in UpdateEvent<keyof GameObjectConfiguration>]: [GameObjectConfiguration[ExtractUpdateEvent<P>]?];
};
