import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { EFFECT_COMPLETE_EVENT_KEY, SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import EventEmitter from "eventemitter3";
import type { Direction, Position } from "grid-engine";

type SceneEventKeys =
  | `${typeof SHOW_MESSAGE_SCENE_EVENT_KEY}${keyof typeof SceneKey}`
  | `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  resize: () => void;
  useItem: (item: Item, sceneKey: SceneKey) => Promise<void>;
  unuseItem: () => Promise<void>;
  playerTeleport: (position: Position, direction?: Direction) => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
