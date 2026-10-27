import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { OriginEventEmitsOptions } from "#src/models/emit/components/OriginEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { OriginSetter } from "#src/models/setterMap/components/OriginSetter";

export const OriginSetterMap = {
  [OriginSetter.DisplayOriginX]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplayOrigin(value, gameObject.displayOriginY);
  },
  [OriginSetter.DisplayOriginY]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplayOrigin(gameObject.displayOriginX, value);
  },
  [OriginSetter.Origin]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(value, value);
  },
  [OriginSetter.OriginX]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(value, gameObject.originY);
  },
  [OriginSetter.OriginY]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(gameObject.originX, value);
  },
} as const satisfies SetterMap<OriginConfiguration, GameObjects.Components.Origin, OriginEventEmitsOptions>;
