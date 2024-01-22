import { type ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import { type WeakSetterMap } from "@/lib/phaser/models/setterMap/WeakSetterMap";
import { AlphaSingleSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/lib/phaser/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { type GameObjects } from "phaser";

export const ContainerSetterMap: WeakSetterMap<ContainerConfiguration, GameObjects.Container> = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
