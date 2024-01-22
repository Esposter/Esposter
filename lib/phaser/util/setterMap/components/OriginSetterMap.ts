import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import { type GameObjects } from "phaser";

export const OriginSetterMap = {
  origin: (gameObject) => (value) => gameObject.setOrigin(value, value),
  originX: (gameObject) => (value) => gameObject.setOrigin(value, gameObject.originY),
  originY: (gameObject) => (value) => gameObject.setOrigin(gameObject.originX, value),
  displayOriginX: (gameObject) => (value) => gameObject.setDisplayOrigin(value, gameObject.displayOriginY),
  displayOriginY: (gameObject) => (value) => gameObject.setDisplayOrigin(gameObject.displayOriginX, value),
} satisfies SetterMap<OriginConfiguration, GameObjects.Components.Origin>;
