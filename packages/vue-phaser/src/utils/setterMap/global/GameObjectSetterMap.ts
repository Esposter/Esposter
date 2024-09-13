import type { GameObjectConfiguration } from "@/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventEmitsOptions } from "@/models/emit/global/GameObjectEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const GameObjectSetterMap = {
  active: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setActive(value);
  },
} as const satisfies SetterMap<GameObjectConfiguration, GameObjects.GameObject, GameObjectEventEmitsOptions>;
