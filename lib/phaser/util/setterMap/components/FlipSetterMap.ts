import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const FlipSetterMap = {
  flipX: (gameObject) => (value) => gameObject.setFlipX(value),
  flipY: (gameObject) => (value) => gameObject.setFlipY(value),
} satisfies SetterMap<GameObjects.Components.Flip, GameObjects.Components.Flip>;
