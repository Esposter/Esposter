import type { GameObjectConfiguration } from "@/lib/phaser/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/global/GameObjectEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const GameObjectSetterMap = {
  active: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setActive(value);
  },
} satisfies SetterMap<GameObjectConfiguration, GameObjects.GameObject, GameObjectEventEmitsOptions>;
