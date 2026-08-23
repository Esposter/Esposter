import type { TextureCropConfiguration } from "#src/models/configuration/components/TextureCropConfiguration";
import type { TextureCropEventEmitsOptions } from "#src/models/emit/components/TextureCropEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "#src/util/setterMap/components/BaseTextureSetterMap";

export const TextureCropSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<
  TextureCropConfiguration,
  GameObjects.Components.TextureCrop,
  TextureCropEventEmitsOptions
>;
