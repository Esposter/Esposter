import { NotFoundError } from "@/models/error/NotFoundError";
import { TilemapInitialPositionMap } from "@/services/dungeons/scene/world/TilemapInitialPositionMap";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";
import type { GameObjects } from "phaser";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey } = storeToRefs(worldSceneStore);
  const respawn = () => {
    const respawnPosition = TilemapInitialPositionMap[tilemapKey.value];
    if (!respawnPosition) throw new NotFoundError(respawn.name, tilemapKey.value);
    player.value.position = structuredClone(respawnPosition);
    player.value.direction = Direction.DOWN;
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
