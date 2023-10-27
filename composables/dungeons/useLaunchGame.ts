import { getPhaserGame } from "@/services/dungeons/getPhaserGame";
import { resizeGame } from "@/services/dungeons/resizeGame";
import { useGameStore } from "@/store/dungeons/game";

export const useLaunchGame = (containerId: string) => {
  const gameStore = useGameStore();
  const { phaserGame } = storeToRefs(gameStore);

  onMounted(() => {
    phaserGame.value = getPhaserGame(containerId);
    resizeGame(phaserGame.value.scale);
    window.addEventListener("resize", () => phaserGame.value && resizeGame(phaserGame.value.scale));
    phaserGame.value.scale.on("orientationchange", () => phaserGame.value && resizeGame(phaserGame.value.scale));
  });

  onUnmounted(() => {
    phaserGame.value?.destroy(false);
    phaserGame.value = null;
  });
};
