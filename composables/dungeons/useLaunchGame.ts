import { phaserEventEmitter } from "@/services/dungeons/events/phaser";
import { getPhaserGame } from "@/services/dungeons/getPhaserGame";
import { useGameStore } from "@/store/dungeons/game";

export const useLaunchGame = (containerId: string) => {
  const gameStore = useGameStore();
  const { phaserGame } = storeToRefs(gameStore);
  const listener = () => phaserEventEmitter.emit("resize");

  onMounted(() => {
    window.addEventListener("resize", listener);

    phaserGame.value = getPhaserGame(containerId);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", listener);

    if (!phaserGame.value) return;
    phaserGame.value.destroy(false);
    phaserGame.value = null;
  });
};
