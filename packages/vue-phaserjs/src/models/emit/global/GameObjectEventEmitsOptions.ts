import type { GameObjectConfiguration } from "@/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventMap } from "@/utils/emit/GameObjectEventMap";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";
import type { Types } from "phaser";
// These include phaser-specific game object events so our setter map doesn't need to implement them
// we can just redirect our vue events to the phaser game object event-equivalent
export type GameObjectEventEmitsOptions = {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
} & {
  [P in UpdateEvent<keyof GameObjectConfiguration>]: [GameObjectConfiguration[ExtractUpdateEvent<P>]?];
};
