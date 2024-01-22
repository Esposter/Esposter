import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type TextureConfiguration } from "@/lib/phaser/models/configuration/components/TextureConfiguration";
import { type GameObjects } from "phaser";

export const TextureCropSetterMap = {
  frame: (gameObject) => (value) => gameObject.setFrame(value),
  textureKey: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTexture(value);
  },
} satisfies SetterMap<TextureConfiguration, GameObjects.Components.TextureCrop>;
