import type { GameObjects } from "phaser";

import { phaserEventEmitter } from "@/services/phaser/events";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  const respawn = async () => {
    const { direction, position, tilemapKey } = structuredClone(toDeepRaw(player.value.respawnLocation));
    await switchToTilemap(tilemapKey);
    phaserEventEmitter.emit("playerTeleport", position, direction);
  };
  const healParty = () => {
    for (const monster of player.value.monsters) monster.status.hp = monster.stats.maxHp;
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
