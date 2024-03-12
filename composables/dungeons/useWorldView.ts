import { usePhaserStore } from "@/lib/phaser/store/phaser";
// @NOTE: Unfortunately the world view isn't really reactive in vue
// because phaser doesn't expose any good events when it's updated :C
export const useWorldView = () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const worldView = computed(() => scene.value.cameras.main.worldView);
  return worldView;
};
