import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { ParticlesEventEmitsOptions } from "#src/models/emit/ParticlesEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/util/setterMap/components/MaskSetterMap";
import { RenderNodesSetterMap } from "#src/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "#src/util/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

export const ParticlesSetterMap: SetterMap<
  ParticlesConfiguration,
  GameObjects.Particles.ParticleEmitter,
  ParticlesEventEmitsOptions
> = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TextureSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
  config: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setConfig(value);
  },
};
