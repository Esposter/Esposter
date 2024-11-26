import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { FlipEventEmitsOptions } from "@/models/emit/components/FlipEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const FlipSetterMap = {
  flipX: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFlipX(value);
  },
  flipY: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFlipY(value);
  },
} as const satisfies SetterMap<FlipConfiguration, GameObjects.Components.Flip, FlipEventEmitsOptions>;
