import type { ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/lib/phaser/models/emit/ZoneEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import type { GameObjects } from "phaser";

export const ZoneSetterMap: SetterMap<ZoneConfiguration, GameObjects.Zone, ZoneEventEmitsOptions> = {
  ...DepthSetterMap,
  ...OriginSetterMap,
  ...TransformSetterMap,
  ...ScrollFactorSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
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
};
