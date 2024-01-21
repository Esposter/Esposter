import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/ScrollFactorConfiguration";
import { type GameObjects } from "phaser";

export const ScrollFactorSetterMap = {
  scrollFactor: (gameObject) => (value) => gameObject.setScrollFactor(value, gameObject.scrollFactorY),
  scrollFactorX: (gameObject) => (value) => gameObject.setScrollFactor(value, gameObject.scrollFactorY),
  scrollFactorY: (gameObject) => (value) => gameObject.setScrollFactor(gameObject.scrollFactorX, value),
} satisfies SetterMap<ScrollFactorConfiguration, GameObjects.Components.ScrollFactor>;
