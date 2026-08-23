import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { TextureEventEmitsOptions } from "#src/models/emit/components/TextureEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "#src/util/setterMap/components/BaseTextureSetterMap";

export const TextureSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<TextureConfiguration, GameObjects.Components.Texture, TextureEventEmitsOptions>;
