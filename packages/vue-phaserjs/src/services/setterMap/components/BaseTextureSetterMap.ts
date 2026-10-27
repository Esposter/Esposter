import type { BaseTextureConfiguration } from "#src/models/configuration/components/BaseTextureConfiguration";
import type { BaseTextureEventEmitsOptions } from "#src/models/emit/components/BaseTextureEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetter } from "#src/models/setterMap/components/BaseTextureSetter";

export const BaseTextureSetterMap = {
  [BaseTextureSetter.Frame]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFrame(value);
  },
  [BaseTextureSetter.Texture]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTexture(value);
  },
} as const satisfies SetterMap<BaseTextureConfiguration, GameObjects.Components.Texture, BaseTextureEventEmitsOptions>;
