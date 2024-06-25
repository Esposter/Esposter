import { useDungeonsStore } from "@/store/dungeons";

export const usePlayerStore = defineStore("dungeons/player", () => {
  const dungeonsStore = useDungeonsStore();
  const { save } = storeToRefs(dungeonsStore);
  const player = computed({
    get: () => save.value.player,
    set: (newPlayer) => {
      save.value.player = newPlayer;
    },
  });
  const isPlayerFainted = computed(() => save.value.player.monsters.every(({ status }) => status.hp === 0));
  return {
    player,
    isPlayerFainted,
  };
});
