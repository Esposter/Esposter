import { type GlobalEventEmitsOptions } from "@/lib/phaser/models/emit/global/GlobalEventEmitsOptions";
import { type GameObjectEventMap } from "@/lib/phaser/util/constants";
import { type Types } from "phaser";

export type GameObjectEventEmitsOptions = {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
} & GlobalEventEmitsOptions;
