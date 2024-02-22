import type { TextureCropConfiguration } from "@/lib/phaser/models/configuration/components/TextureCropConfiguration";
import type { TextureCropEventEmitsOptions } from "@/lib/phaser/models/emit/components/TextureCropEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TextureCropSetterMap = {
  frame: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFrame(value);
  },
  textureKey: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTexture(value);
  },
} satisfies SetterMap<TextureCropConfiguration, GameObjects.Components.TextureCrop, TextureCropEventEmitsOptions>;
