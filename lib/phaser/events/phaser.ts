import type { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import EventEmitter from "eventemitter3";

type SceneEventKeys = `${typeof SHOW_MESSAGE_SCENE_EVENT_KEY}${keyof typeof SceneKey}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  resize: () => void;
  useItem: (item: Item, sceneKey: SceneKey) => void;
  unuseItem: () => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
