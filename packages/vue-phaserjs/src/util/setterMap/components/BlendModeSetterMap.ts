import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { BlendModeEventEmitsOptions } from "@/models/emit/components/BlendModeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const BlendModeSetterMap = {
  blendMode: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setBlendMode(value);
  },
} as const satisfies SetterMap<BlendModeConfiguration, GameObjects.Components.BlendMode, BlendModeEventEmitsOptions>;
