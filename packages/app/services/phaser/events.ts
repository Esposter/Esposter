import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import EventEmitter from "eventemitter3";
import type { Direction, Position } from "grid-engine";

type SceneEventKeys = `${SceneEventKey}${keyof typeof SceneKey}` | `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  useItem: (scene: SceneWithPlugins, item: Item, monster: Monster) => Promise<void>;
  unuseItem: () => Promise<void>;
  switchMonster: (monster: Monster) => Promise<void>;
  unswitchMonster: () => Promise<void>;
  playerTeleport: (position: Position, direction?: Direction) => void;
  playerMonsterInfoContainerAppear: () => void;
  levelUp: (monster: Monster, onComplete: () => void) => Promise<void>;
  levelUpComplete: () => Promise<void>;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
