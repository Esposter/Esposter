import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/models/emit/ZoneEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const ZoneSetterMap: SetterMap<ZoneConfiguration, GameObjects.Zone, ZoneEventEmitsOptions> = {
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
  height: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(gameObject.width, value);
  },
  width: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(value, gameObject.height);
  },
  ...DepthSetterMap,
  ...OriginSetterMap,
  ...TransformSetterMap,
  ...ScrollFactorSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
