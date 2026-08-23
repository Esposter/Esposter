import type { BaseTextureConfiguration } from "#src/models/configuration/components/BaseTextureConfiguration";
import type { BaseTextureEventEmitsOptions } from "#src/models/emit/components/BaseTextureEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
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
