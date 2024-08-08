import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { GlobalEventEmitsOptions } from "@/lib/phaser/models/emit/global/GlobalEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GameObjectSetterMap } from "@/lib/phaser/util/setterMap/global/GameObjectSetterMap";
import { TweenSetterMap } from "@/lib/phaser/util/setterMap/global/TweenSetterMap";

export const GlobalSetterMap = {
  ...TweenSetterMap,
  ...GameObjectSetterMap,
} as const satisfies SetterMap<GlobalConfiguration, GameObjects.GameObject, GlobalEventEmitsOptions>;
