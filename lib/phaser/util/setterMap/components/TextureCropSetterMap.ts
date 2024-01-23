import { type TextureCropConfiguration } from "@/lib/phaser/models/configuration/components/TextureCropConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const TextureCropSetterMap = {
  frame: (gameObject) => (value) => gameObject.setFrame(value),
  textureKey: (gameObject) => (value) => gameObject.setTexture(value),
} satisfies SetterMap<TextureCropConfiguration, GameObjects.Components.TextureCrop>;
