import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { ScrollFactorEventEmitsOptions } from "#src/models/emit/components/ScrollFactorEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ScrollFactorSetter } from "#src/models/setterMap/components/ScrollFactorSetter";

export const ScrollFactorSetterMap = {
  [ScrollFactorSetter.ScrollFactor]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(value, value);
  },
  [ScrollFactorSetter.ScrollFactorX]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(value, gameObject.scrollFactorY);
  },
  [ScrollFactorSetter.ScrollFactorY]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(gameObject.scrollFactorX, value);
  },
} as const satisfies SetterMap<
  ScrollFactorConfiguration,
  GameObjects.Components.ScrollFactor,
  ScrollFactorEventEmitsOptions
>;
