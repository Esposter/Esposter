import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { ComputedSizeEventEmitsOptions } from "@/models/emit/components/ComputedSizeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const ComputedSizeSetterMap = {
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
  height: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(gameObject.width, value);
  },
  width: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(value, gameObject.height);
  },
} as const satisfies SetterMap<
  ComputedSizeConfiguration,
  GameObjects.Components.ComputedSize,
  ComputedSizeEventEmitsOptions
>;
