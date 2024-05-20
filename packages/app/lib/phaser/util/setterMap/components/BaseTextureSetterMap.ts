import type { BaseTextureConfiguration } from "@/lib/phaser/models/configuration/components/BaseTextureConfiguration";
import type { BaseTextureEventEmitsOptions } from "@/lib/phaser/models/emit/components/BaseTextureEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const BaseTextureSetterMap = {
  frame: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFrame(value);
  },
  texture: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTexture(value);
  },
} as const satisfies SetterMap<BaseTextureConfiguration, GameObjects.Components.Texture, BaseTextureEventEmitsOptions>;
