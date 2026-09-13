import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { OriginEventEmitsOptions } from "#src/models/emit/components/OriginEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const OriginSetterMap = {
  displayOriginX: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplayOrigin(value, gameObject.displayOriginY);
  },
  displayOriginY: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplayOrigin(gameObject.displayOriginX, value);
  },
  origin: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(value, value);
  },
  originX: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(value, gameObject.originY);
  },
  originY: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOrigin(gameObject.originX, value);
  },
} as const satisfies SetterMap<OriginConfiguration, GameObjects.Components.Origin, OriginEventEmitsOptions>;
