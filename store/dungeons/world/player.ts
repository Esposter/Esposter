import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";
import type { GameObjects } from "phaser";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  const respawn = async () => {
    await switchToTilemap(player.value.respawnLocation.tilemapKey);
    phaserEventEmitter.emit("playerTeleport", structuredClone(toDeepRaw(player.value.respawnLocation.position)));
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
