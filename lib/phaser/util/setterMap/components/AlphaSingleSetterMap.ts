import { type AlphaSingleConfiguration } from "@/lib/phaser/models/configuration/components/AlphaSingleConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const AlphaSingleSetterMap = {
  alpha: (gameObject) => (value) => gameObject.setAlpha(value),
} satisfies SetterMap<AlphaSingleConfiguration, GameObjects.Components.AlphaSingle>;
