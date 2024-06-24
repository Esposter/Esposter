import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX, SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/services/phaser/constants";
import EventEmitter from "eventemitter3";
import type { Direction, Position } from "grid-engine";

type SceneEventKeys =
  | `${typeof SHOW_MESSAGE_SCENE_EVENT_KEY}${keyof typeof SceneKey}`
  | `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  useItem: (item: Item, sceneKey: SceneKey) => Promise<void>;
  unuseItem: () => Promise<void>;
  playerTeleport: (position: Position, direction?: Direction) => void;
  levelUp: (monster: Monster, onComplete: () => void, isSkipAnimations?: true) => Promise<void>;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
