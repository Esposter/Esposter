import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { MaskEventEmitsOptions } from "#src/models/emit/components/MaskEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import { MaskSetter } from "#src/models/setterMap/components/MaskSetter";

export const MaskSetterMap = {
  [MaskSetter.Mask]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setMask(value);
  },
} as const satisfies SetterMap<MaskConfiguration, GameObjects.Components.Mask, MaskEventEmitsOptions>;
