import { type FlipConfiguration } from "@/lib/phaser/models/configuration/components/FlipConfiguration";
import { type FlipEventEmitsOptions } from "@/lib/phaser/models/emit/components/FlipEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const FlipSetterMap = {
  flipX: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setFlipX(value);
  },
  flipY: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setFlipY(value);
  },
} satisfies SetterMap<FlipConfiguration, GameObjects.Components.Flip, FlipEventEmitsOptions>;
