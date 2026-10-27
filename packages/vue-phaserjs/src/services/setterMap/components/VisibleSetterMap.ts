import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { VisibleEventEmitsOptions } from "#src/models/emit/components/VisibleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { VisibleSetter } from "#src/models/setterMap/components/VisibleSetter";

export const VisibleSetterMap = {
  [VisibleSetter.Visible]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setVisible(value);
  },
} as const satisfies SetterMap<VisibleConfiguration, GameObjects.Components.Visible, VisibleEventEmitsOptions>;
