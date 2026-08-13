import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/models/emit/ZoneEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const ZoneSetterMap: SetterMap<ZoneConfiguration, GameObjects.Zone, ZoneEventEmitsOptions> = {
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...OriginSetterMap,
  ...TransformSetterMap,
  ...ScrollFactorSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
