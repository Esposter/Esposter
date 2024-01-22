import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";
import { type GlobalConfiguration } from "~/lib/phaser/models/configuration/global/GlobalConfiguration";
import { TweenSetterMap } from "~/lib/phaser/util/setterMap/global/TweenSetterMap";

export const GlobalSetterMap = {
  ...TweenSetterMap,
} satisfies SetterMap<GlobalConfiguration, GameObjects.GameObject>;
