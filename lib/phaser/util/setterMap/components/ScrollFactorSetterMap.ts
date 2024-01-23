import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const ScrollFactorSetterMap = {
  scrollFactor: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setScrollFactor(value, gameObject.scrollFactorY);
  },
  scrollFactorX: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setScrollFactor(value, gameObject.scrollFactorY);
  },
  scrollFactorY: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setScrollFactor(gameObject.scrollFactorX, value);
  },
} satisfies SetterMap<ScrollFactorConfiguration, GameObjects.Components.ScrollFactor>;
