import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const SizeSetterMap = {
  width: (gameObject) => (value) => gameObject.setSize(value, gameObject.height),
  height: (gameObject) => (value) => gameObject.setSize(gameObject.width, value),
  displayWidth: (gameObject) => (value) => gameObject.setDisplaySize(value, gameObject.displayHeight),
  displayHeight: (gameObject) => (value) => gameObject.setDisplaySize(gameObject.displayWidth, value),
} satisfies SetterMap<GameObjects.Components.Size, GameObjects.Components.Size>;
