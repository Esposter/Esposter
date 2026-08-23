import type { ZoneConfiguration } from "#src/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "#src/models/emit/ZoneEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { OriginSetterMap } from "#src/util/setterMap/components/OriginSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

export const ZoneSetterMap: SetterMap<ZoneConfiguration, GameObjects.Zone, ZoneEventEmitsOptions> = {
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...OriginSetterMap,
  ...TransformSetterMap,
  ...ScrollFactorSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
