import { usePlayerStore } from "@/store/dungeons/player";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
  const playerStore = usePlayerStore();
  const inventory = computed({
    get: () => playerStore.player.inventory,
    set: (newInventory) => {
      playerStore.player.inventory = newInventory;
    },
  });
  return {
    inventory,
  };
});
