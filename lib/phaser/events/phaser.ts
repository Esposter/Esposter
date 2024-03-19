import type { BEFORE_DESTROY_SCENE_EVENT_KEY, SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import EventEmitter from "eventemitter3";

type SceneEventKeys =
  `${typeof BEFORE_DESTROY_SCENE_EVENT_KEY | typeof SHOW_MESSAGE_SCENE_EVENT_KEY}${keyof typeof SceneKey}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  resize: () => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
