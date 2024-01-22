import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const AlphaSingleSetterMap = {
  alpha: (gameObject) => (value) => gameObject.setAlpha(value),
} satisfies SetterMap<GameObjects.Components.AlphaSingle, GameObjects.Components.AlphaSingle>;
