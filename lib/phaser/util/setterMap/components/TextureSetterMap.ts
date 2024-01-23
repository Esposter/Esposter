import { type TextureConfiguration } from "@/lib/phaser/models/configuration/components/TextureConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const TextureSetterMap = {
  frame: (gameObject) => (value) => gameObject.setFrame(value),
  textureKey: (gameObject) => (value) => gameObject.setTexture(value),
} satisfies SetterMap<TextureConfiguration, GameObjects.Components.Texture>;
