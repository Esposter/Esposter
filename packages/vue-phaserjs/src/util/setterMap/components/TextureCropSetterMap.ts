import type { TextureCropConfiguration } from "@/models/configuration/components/TextureCropConfiguration";
import type { TextureCropEventEmitsOptions } from "@/models/emit/components/TextureCropEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "@/util/setterMap/components/BaseTextureSetterMap";

export const TextureCropSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<
  TextureCropConfiguration,
  GameObjects.Components.TextureCrop,
  TextureCropEventEmitsOptions
>;
