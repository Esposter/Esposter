import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { ParticlesEventEmitsOptions } from "#src/models/emit/ParticlesEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

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
  ...SceneObjectSetterMap,
  ...RenderNodesSetterMap,
  ...TextureSetterMap,
  ...GlobalSetterMap,
};
