import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { SceneEvents } from "@/models/phaser/SceneEvents";
import type { Direction, Position } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

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
