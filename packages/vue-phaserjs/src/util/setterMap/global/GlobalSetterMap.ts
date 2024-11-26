import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { GlobalEventEmitsOptions } from "@/models/emit/global/GlobalEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GameObjectSetterMap } from "@/util/setterMap/global/GameObjectSetterMap";
import { TweenSetterMap } from "@/util/setterMap/global/TweenSetterMap";

export const GlobalSetterMap = {
  ...TweenSetterMap,
  ...GameObjectSetterMap,
} as const satisfies SetterMap<GlobalConfiguration, GameObjects.GameObject, GlobalEventEmitsOptions>;
