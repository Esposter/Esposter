import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { ParticlesEventEmitsOptions } from "#src/models/emit/ParticlesEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";

export const ParticlesSetterMap: SetterMap<
  ParticlesConfiguration,
  GameObjects.Particles.ParticleEmitter,
  ParticlesEventEmitsOptions
> = {
  config: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setConfig(value);
  },
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
};
