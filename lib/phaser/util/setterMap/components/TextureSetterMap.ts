import type { TextureConfiguration } from "@/lib/phaser/models/configuration/components/TextureConfiguration";
import type { TextureEventEmitsOptions } from "@/lib/phaser/models/emit/components/TextureEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TextureSetterMap = {
  frame: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFrame(value);
  },
  textureKey: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTexture(value);
  },
} as const satisfies SetterMap<TextureConfiguration, GameObjects.Components.Texture, TextureEventEmitsOptions>;
