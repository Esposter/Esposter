import type { GameObjects } from "phaser";

import { phaserEventEmitter } from "@/services/phaser/events";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { toRawDeep } from "@esposter/shared";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  const respawn = async () => {
    const { direction, position, tilemapKey } = structuredClone(toRawDeep(playerStore.player.respawnLocation));
    await switchToTilemap(tilemapKey);
    phaserEventEmitter.emit("playerTeleport", position, direction);
  };
  const healParty = () => {
    for (const monster of monsterPartySceneStore.monsters) monster.status.hp = monster.stats.maxHp;
  };

  const sprite = ref<GameObjects.Sprite>();
  const isMoving = ref(false);
  return {
    healParty,
    isMoving,
    respawn,
    sprite,
  };
});
