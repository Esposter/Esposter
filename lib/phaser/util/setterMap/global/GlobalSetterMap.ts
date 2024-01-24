import { type GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import { type GlobalEventEmitsOptions } from "@/lib/phaser/models/emit/global/GlobalEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { TweenSetterMap } from "@/lib/phaser/util/setterMap/global/TweenSetterMap";
import { type GameObjects } from "phaser";

export const GlobalSetterMap = {
  ...TweenSetterMap,
} satisfies SetterMap<GlobalConfiguration, GameObjects.GameObject, GlobalEventEmitsOptions>;
