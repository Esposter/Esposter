import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects, type Types } from "phaser";

export const TextSetterMap = {
  alpha: (gameObject) => (value) => gameObject.setAlpha(value),
  angle: (gameObject) => (value) => gameObject.setAngle(value),
  blendMode: (gameObject) => (value) => gameObject.setBlendMode(value),
  depth: (gameObject) => (value) => {
    gameObject.setDepth(value);
    if (!gameObject.parentContainer) return;

    const i = gameObject.parentContainer.list.findIndex(
      (obj) => "depth" in obj && typeof obj.depth === "number" && obj.depth > gameObject.depth,
    );
    i === -1
      ? gameObject.parentContainer.bringToTop(gameObject)
      : gameObject.parentContainer.moveTo(gameObject, Math.max(i - 1, 0));
  },
  flipX: (gameObject) => (value) => gameObject.setFlipX(value),
  flipY: (gameObject) => (value) => gameObject.setFlipY(value),
  origin: (gameObject) => (value) => gameObject.setOrigin(value, value),
  padding: (gameObject) => (value) => gameObject.setPadding(value),
  rotation: (gameObject) => (value) => gameObject.setRotation(value),
  scale: (gameObject) => (value) => gameObject.setScale(value, value),
  scrollFactor: (gameObject) => (value) => gameObject.setScrollFactor(value),
  style: (gameObject) => (value) => gameObject.setStyle(value),
  text: (gameObject) => (value) => gameObject.setText(value),
  visible: (gameObject) => (value) => gameObject.setVisible(value),
  x: (gameObject) => (value) => gameObject.setX(value),
  y: (gameObject) => (value) => gameObject.setY(value),
} satisfies SetterMap<Types.GameObjects.Text.TextConfig, GameObjects.Text>;
