import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { BlendModeEventEmitsOptions } from "#src/models/emit/components/BlendModeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import { BlendModeSetter } from "#src/models/setterMap/components/BlendModeSetter";

export const BlendModeSetterMap = {
  [BlendModeSetter.BlendMode]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setBlendMode(value);
  },
} as const satisfies SetterMap<BlendModeConfiguration, GameObjects.Components.BlendMode, BlendModeEventEmitsOptions>;
