import type { BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import type { BlendModeEventEmitsOptions } from "@/lib/phaser/models/emit/components/BlendModeEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const BlendModeSetterMap = {
  blendMode: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setBlendMode(value);
  },
} as const satisfies SetterMap<BlendModeConfiguration, GameObjects.Components.BlendMode, BlendModeEventEmitsOptions>;
