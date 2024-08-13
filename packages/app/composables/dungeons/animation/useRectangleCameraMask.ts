import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";

import { useSettingsStore } from "@/store/dungeons/settings";
import { Geom, Math } from "phaser";

export const useRectangleCameraMask = async (scene: SceneWithPlugins, onComplete?: OnComplete) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) {
    await onComplete?.();
    return;
  }

  const { height, width } = scene.scale;
  const rectangleShape = new Geom.Rectangle(0, height / 2, width, 0);
  const graphics = scene.add.graphics().fillRectShape(rectangleShape).setDepth(-1);
  const mask = graphics.createGeometryMask();

  scene.cameras.main.setMask(mask);
  scene.tweens.add({
    delay: 400,
    duration: 800,
    height: {
      ease: Math.Easing.Expo.InOut,
      from: 0,
      start: 0,
      to: height,
    },
    onComplete: async () => {
      mask.destroy();
      scene.cameras.main.clearMask();
      await onComplete?.();
    },
    onUpdate: () => {
      graphics.clear().fillRectShape(rectangleShape);
    },
    targets: rectangleShape,
    y: {
      ease: Math.Easing.Expo.InOut,
      from: height / 2,
      start: height / 2,
      to: 0,
    },
  });
};
