import { useDungeonsStore } from "#src/store/dungeons/index";

export const usePlayerStore = defineStore("dungeons/player", () => {
  const dungeonsStore = useDungeonsStore();
  const player = computed({
    get: () => dungeonsStore.save.player,
    set: (newPlayer) => {
      dungeonsStore.save.player = newPlayer;
    },
  });
  return { player };
});
