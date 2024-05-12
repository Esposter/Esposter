import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { getInitialMetadata } from "@/services/dungeons/scene/world/TilemapInitialPositionMap";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { GameObjects } from "phaser";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey } = storeToRefs(worldSceneStore);
  const respawn = () => {
    const { position, direction } = getInitialMetadata(tilemapKey.value);
    phaserEventEmitter.emit("playerTeleport", position, direction);
  };
  const healParty = () => {
    for (const monster of player.value.monsters) monster.currentHp = monster.stats.maxHp;
  };

  const sprite = ref<GameObjects.Sprite>();
  const isMoving = ref(false);
  return {
    respawn,
    healParty,
    sprite,
    isMoving,
  };
});
