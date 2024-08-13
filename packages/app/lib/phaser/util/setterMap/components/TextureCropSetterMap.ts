import type { TextureCropConfiguration } from "@/lib/phaser/models/configuration/components/TextureCropConfiguration";
import type { TextureCropEventEmitsOptions } from "@/lib/phaser/models/emit/components/TextureCropEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "@/lib/phaser/util/setterMap/components/BaseTextureSetterMap";

export const TextureCropSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<
  TextureCropConfiguration,
  GameObjects.Components.TextureCrop,
  TextureCropEventEmitsOptions
>;
