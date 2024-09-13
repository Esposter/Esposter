import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/models/emit/ZoneEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

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
