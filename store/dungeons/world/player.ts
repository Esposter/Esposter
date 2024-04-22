import { INITIAL_POSITION } from "@/services/dungeons/scene/world/home/constants";
import { usePlayerStore } from "@/store/dungeons/player";
import { Direction } from "grid-engine";
import type { GameObjects } from "phaser";

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const respawn = () => {
    player.value.position = INITIAL_POSITION;
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
