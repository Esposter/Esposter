import type { ContainerConfiguration } from "#src/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "#src/models/emit/ContainerEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";

export const ContainerSetterMap: SetterMap<ContainerConfiguration, GameObjects.Container, ContainerEventEmitsOptions> =
  {
    ...AlphaSingleSetterMap,
    ...BlendModeSetterMap,
    ...DepthSetterMap,
    ...MaskSetterMap,
    ...ScrollFactorSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
