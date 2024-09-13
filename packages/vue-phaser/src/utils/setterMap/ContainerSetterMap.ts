import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/models/emit/ContainerEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/utils/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/utils/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

export const ContainerSetterMap: SetterMap<ContainerConfiguration, GameObjects.Container, ContainerEventEmitsOptions> =
  {
    ...AlphaSingleSetterMap,
    ...BlendModeSetterMap,
    ...ComputedSizeSetterMap,
    ...DepthSetterMap,
    ...MaskSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
