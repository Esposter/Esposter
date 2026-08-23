import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { GlobalEventEmitsOptions } from "#src/models/emit/global/GlobalEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GameObjectSetterMap } from "#src/util/setterMap/global/GameObjectSetterMap";
import { TweenSetterMap } from "#src/util/setterMap/global/TweenSetterMap";

export const GlobalSetterMap = {
  ...TweenSetterMap,
  ...GameObjectSetterMap,
} as const satisfies SetterMap<GlobalConfiguration, GameObjects.GameObject, GlobalEventEmitsOptions>;
