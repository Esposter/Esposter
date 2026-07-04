import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { ComputedSizeEventEmitsOptions } from "@/models/emit/components/ComputedSizeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

// Only requires setDisplaySize so it is reusable by shapes (e.g. Arc, Star) that have no setSize.
export const DisplaySizeSetterMap = {
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
} as const satisfies SetterMap<
  Pick<ComputedSizeConfiguration, "displayHeight" | "displayWidth">,
  Pick<GameObjects.Components.ComputedSize, "displayHeight" | "displayWidth" | "setDisplaySize">,
  ComputedSizeEventEmitsOptions
>;
