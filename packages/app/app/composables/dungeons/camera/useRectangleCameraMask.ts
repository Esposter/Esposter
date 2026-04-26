import type { GameObjects } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useSettingsStore } from "@/store/dungeons/settings";
import { Filters, Geom, Math } from "phaser";

const maskMap = new WeakMap<
  SceneWithPlugins,
  {
    graphics: GameObjects.Graphics;
    mask: Filters.Mask;
  }
>();

export const useRectangleCameraMask = (scene: SceneWithPlugins) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return undefined;

  const existingMask = maskMap.get(scene);
  if (existingMask) {
    scene.cameras.main.filters.internal.remove(existingMask.mask);
    existingMask.graphics.destroy();
    maskMap.delete(scene);
  }

  const { height, width } = scene.scale;
  const rectangleShape = new Geom.Rectangle(0, height / 2, width, 0);
  const graphics = scene.add.graphics().fillRectShape(rectangleShape).setDepth(-1);
  const mask = scene.cameras.main.filters.internal.addMask(graphics);
  maskMap.set(scene, { graphics, mask });
  return new Promise<void>((resolve) => {
    scene.tweens.add({
      delay: 400,
      duration: 800,
      height: {
        ease: Math.Easing.Expo.InOut,
        from: 0,
        start: 0,
        to: height,
      },
      onComplete: () => {
        scene.cameras.main.filters.internal.remove(mask);
        graphics.destroy();
        maskMap.delete(scene);
        resolve();
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
  });
};
