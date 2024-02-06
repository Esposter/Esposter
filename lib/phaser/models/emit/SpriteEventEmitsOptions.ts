import { type SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import { type SpriteEventMap } from "@/lib/phaser/util/emit/SpriteEventMap";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";
import { type Types } from "phaser";

export type SpriteEventEmitsOptions = {
  [P in UpdateEvent<keyof SpriteConfiguration>]: [SpriteConfiguration[ExtractUpdateEvent<P>]?];
} & {
  [P in keyof typeof SpriteEventMap]: Types.Input.EventData[];
};
