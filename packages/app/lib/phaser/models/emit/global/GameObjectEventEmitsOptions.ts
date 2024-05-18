import type { GameObjectConfiguration } from "@/lib/phaser/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";
import type { Types } from "phaser";
// These include phaser-specific game object events so our setter map doesn't need to implement them
// we can just redirect our vue events to the phaser game object event-equivalent
export type GameObjectEventEmitsOptions = {
  [P in UpdateEvent<keyof GameObjectConfiguration>]: [GameObjectConfiguration[ExtractUpdateEvent<P>]?];
} & {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
};
