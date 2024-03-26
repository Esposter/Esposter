import { useGameStore } from "@/store/dungeons/game";

export const useMonsterPartySceneStore = defineStore("dungeons/monsterParty/scene", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const monsters = computed({
    get: () => save.value.player.monsters,
    set: (newMonsters) => {
      save.value.player.monsters = newMonsters;
    },
  });
  return {
    monsters,
  };
});
