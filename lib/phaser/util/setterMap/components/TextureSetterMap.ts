import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const TextureSetterMap = {
  frame: (gameObject) => (value) => gameObject.setFrame(value),
  texture: (gameObject) => (value) => gameObject.setTexture(value),
} satisfies SetterMap<GameObjects.Components.Texture, GameObjects.Components.Texture>;
