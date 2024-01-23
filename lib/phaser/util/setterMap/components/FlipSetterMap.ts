import { type FlipConfiguration } from "@/lib/phaser/models/configuration/components/FlipConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const FlipSetterMap = {
  flipX: (gameObject) => (value) => gameObject.setFlipX(value),
  flipY: (gameObject) => (value) => gameObject.setFlipY(value),
} satisfies SetterMap<FlipConfiguration, GameObjects.Components.Flip>;
