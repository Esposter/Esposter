import { useGameStore } from "@/store/dungeons/game";

export const usePlayerStore = defineStore("dungeons/player", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const player = computed({
    get: () => save.value.player,
    set: (newPlayer) => {
      save.value.player = newPlayer;
    },
  });
  const isPlayerFainted = computed(() => save.value.player.monsters.every((m) => m.currentHp === 0));
  return {
    player,
    isPlayerFainted,
  };
});
