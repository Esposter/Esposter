import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const TextureCropSetterMap = {
  frame: (gameObject) => (value) => gameObject.setFrame(value),
  texture: (gameObject) => (value) => gameObject.setTexture(value),
} satisfies SetterMap<GameObjects.Components.TextureCrop, GameObjects.Components.TextureCrop>;
