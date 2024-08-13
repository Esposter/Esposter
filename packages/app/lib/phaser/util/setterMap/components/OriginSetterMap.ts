import type { OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import type { OriginEventEmitsOptions } from "@/lib/phaser/models/emit/components/OriginEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const OriginSetterMap = {
  displayOriginX: (gameObject) => (value) => gameObject.setDisplayOrigin(value, gameObject.displayOriginY),
  displayOriginY: (gameObject) => (value) => gameObject.setDisplayOrigin(gameObject.displayOriginX, value),
  origin: (gameObject) => (value) => gameObject.setOrigin(value, value),
  originX: (gameObject) => (value) => gameObject.setOrigin(value, gameObject.originY),
  originY: (gameObject) => (value) => gameObject.setOrigin(gameObject.originX, value),
} as const satisfies SetterMap<OriginConfiguration, GameObjects.Components.Origin, OriginEventEmitsOptions>;
