import { GameScene } from "@/models/dungeons/scenes/GameScene";
import { useGameStore } from "@/store/dungeons/game";
import { GridEngine } from "grid-engine";
import { AUTO, Game, Scale } from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

export const useLaunchGame = (containerId: string) => {
  const { surface } = useColors();
  const gameStore = useGameStore();
  const { phaserGame } = storeToRefs(gameStore);

  onMounted(() => {
    phaserGame.value = new Game({
      title: "Dungeons",
      type: AUTO,
      parent: containerId,
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
      backgroundColor: surface.value,
      scene: GameScene,
      input: {
        keyboard: true,
        touch: true,
      },
      plugins: {
        scene: [
          {
            key: "gridEngine",
            plugin: GridEngine,
            mapping: "gridEngine",
          },
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            mapping: "rexVirtualJoystick",
          },
        ],
      },
    });
  });

  onUnmounted(() => {
    phaserGame.value?.destroy(false);
    phaserGame.value = null;
  });
};
