import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import type { Direction, Position } from "grid-engine";

import EventEmitter from "eventemitter3";

type SceneEventKeys = `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}` | `${SceneEventKey}${keyof typeof SceneKey}`;
type SceneEvents = {
  [P in SceneEventKeys]: () => void;
};

export interface PhaserEvents extends SceneEvents {
  levelUp: (monster: Monster, onComplete: () => void) => Promise<void>;
  levelUpComplete: () => Promise<void>;
  playerMonsterInfoContainerAppear: () => void;
  playerTeleport: (position: Position, direction?: Direction) => void;
  switchMonster: (monster: Monster) => Promise<void>;
  unswitchMonster: () => Promise<void>;
  unuseItem: () => Promise<void>;
  useItem: (scene: SceneWithPlugins, item: Item, monster: Monster) => Promise<void>;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
