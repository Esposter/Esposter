import { type SizeConfiguration } from "@/lib/phaser/models/configuration/components/SizeConfiguration";
import { type SizeEventEmitsOptions } from "@/lib/phaser/models/emit/components/SizeEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const SizeSetterMap = {
  width: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(value, gameObject.height);
  },
  height: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(gameObject.width, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
} satisfies SetterMap<SizeConfiguration, GameObjects.Components.Size, SizeEventEmitsOptions>;
