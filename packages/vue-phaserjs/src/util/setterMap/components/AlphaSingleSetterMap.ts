import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { AlphaSingleEventEmitsOptions } from "@/models/emit/components/AlphaSingleEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const AlphaSingleSetterMap = {
  alpha: (gameObject) => (value) => gameObject.setAlpha(value),
} as const satisfies SetterMap<
  AlphaSingleConfiguration,
  GameObjects.Components.AlphaSingle,
  AlphaSingleEventEmitsOptions
>;
