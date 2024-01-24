import { type GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { type Types } from "phaser";
// These are phaser-specific game object events so our setter map doesn't need to implement them
// we can just redirect our vue events to the phaser game object event-equivalent
export type GameObjectEventEmitsOptions = {
  [P in keyof typeof GameObjectEventMap]: Types.Input.EventData[];
};
