import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import type { Direction, Position } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import EventEmitter from "eventemitter3";

type SceneEventKeys = `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}` | `${SceneEventKey}${keyof typeof SceneKey}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  levelUp: (monster: Monster, onComplete: () => void) => void;
  levelUpComplete: () => void;
  playerMonsterInfoContainerAppear: () => void;
  playerTeleport: (position: Position, direction?: Direction) => void;
  switchMonster: (monster: Monster) => void;
  unswitchMonster: () => void;
  unuseItem: () => void;
  useItem: (scene: SceneWithPlugins, item: Item, monster: Monster, onComplete: () => Promise<void>) => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
