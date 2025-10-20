import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/models/emit/ContainerEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const ContainerSetterMap: SetterMap<ContainerConfiguration, GameObjects.Container, ContainerEventEmitsOptions> =
  {
    ...AlphaSingleSetterMap,
    ...BlendModeSetterMap,
    ...ComputedSizeSetterMap,
    ...DepthSetterMap,
    ...ScrollFactorSetterMap,
    ...MaskSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
