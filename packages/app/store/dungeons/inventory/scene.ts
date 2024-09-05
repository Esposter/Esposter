import { usePlayerStore } from "@/store/dungeons/player";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const inventory = computed({
    get: () => player.value.inventory,
    set: (newInventory) => {
      player.value.inventory = newInventory;
    },
  });

  return {
    inventory,
  };
});
