import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Geom, Math } from "phaser";

export const useRectangleCameraMask = (onComplete?: () => void) => {
  const settingsStore = useSettingsStore();
  const { isSkipBattleAnimations } = storeToRefs(settingsStore);
  if (isSkipBattleAnimations.value) {
    onComplete?.();
    return;
  }

  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const { width, height } = scene.value.scale;
  const rectangleShape = new Geom.Rectangle(0, height / 2, width, 0);
  const graphics = scene.value.add.graphics().fillRectShape(rectangleShape).setDepth(-1);
  const mask = graphics.createGeometryMask();

  scene.value.cameras.main.setMask(mask);
  scene.value.tweens.add({
    targets: rectangleShape,
    delay: 400,
    duration: 800,
    height: {
      ease: Math.Easing.Expo.InOut,
      from: 0,
      start: 0,
      to: height,
    },
    y: {
      ease: Math.Easing.Expo.InOut,
      from: height / 2,
      start: height / 2,
      to: 0,
    },
    onUpdate: () => {
      graphics.clear().fillRectShape(rectangleShape);
    },
    onComplete: () => {
      mask.destroy();
      scene.value.cameras.main.clearMask();
      onComplete?.();
    },
  });
};
