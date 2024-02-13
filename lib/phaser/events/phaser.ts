import { type BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type SceneKey } from "@/models/dungeons/keys/SceneKey";
import EventEmitter from "eventemitter3";

type DestroySceneEventKeys = `${typeof BEFORE_DESTROY_SCENE_EVENT_KEY}${keyof typeof SceneKey}`;
type DestroySceneEvents = {
  [P in DestroySceneEventKeys]: () => void;
};

export interface PhaserEvents extends DestroySceneEvents {
  resize: () => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
