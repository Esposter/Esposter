import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { AlphaSingleSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/lib/phaser/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { type GameObjects, type Types } from "phaser";

export const ContainerSetterMap: SetterMap<Types.GameObjects.Container.ContainerConfig, GameObjects.Container> = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
};
