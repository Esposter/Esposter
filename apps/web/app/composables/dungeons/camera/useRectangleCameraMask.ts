import type { Filters, GameObjects } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useSkippableAnimation } from "@/composables/dungeons/animation/useSkippableAnimation";
import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { Geom, Math } from "phaser";

interface CameraMask {
  graphics: GameObjects.Graphics;
  mask: Filters.Mask;
}

const maskMap = new WeakMap<SceneWithPlugins, CameraMask>();

const removeCameraMask = (scene: SceneWithPlugins, { graphics, mask }: CameraMask) => {
  scene.cameras.main.filters.internal.remove(mask);
  graphics.destroy();
  maskMap.delete(scene);
};

export const useRectangleCameraMask = (scene: SceneWithPlugins) =>
  useSkippableAnimation(
    () =>
      new Promise<void>((resolve) => {
        const existingMask = maskMap.get(scene);
        if (existingMask) removeCameraMask(scene, existingMask);

        const { height, width } = scene.scale;
        const rectangleShape = new Geom.Rectangle(0, height / 2, width, 0);
        const graphics = scene.add.graphics().fillRectShape(rectangleShape).setDepth(-1);
        const mask = scene.cameras.main.filters.internal.addMask(graphics);
        maskMap.set(scene, { graphics, mask });
        scene.tweens.add({
          delay: 400,
          duration: 800,
          height: { ease: Math.Easing.Expo.InOut, ...getTweenRange(0, height) },
          onComplete: () => {
            removeCameraMask(scene, { graphics, mask });
            resolve();
          },
          onUpdate: () => {
            graphics.clear().fillRectShape(rectangleShape);
          },
          targets: rectangleShape,
          y: { ease: Math.Easing.Expo.InOut, ...getTweenRange(height / 2, 0) },
        });
      }),
  );
