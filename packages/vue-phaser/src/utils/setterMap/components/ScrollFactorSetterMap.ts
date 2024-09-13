import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { ScrollFactorEventEmitsOptions } from "@/models/emit/components/ScrollFactorEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const ScrollFactorSetterMap = {
  scrollFactor: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(value, value);
  },
  scrollFactorX: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(value, gameObject.scrollFactorY);
  },
  scrollFactorY: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScrollFactor(gameObject.scrollFactorX, value);
  },
} as const satisfies SetterMap<
  ScrollFactorConfiguration,
  GameObjects.Components.ScrollFactor,
  ScrollFactorEventEmitsOptions
>;
