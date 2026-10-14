import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";
import type { Types } from "phaser";

export interface ParticlesConfiguration
  extends
    AlphaSingleConfiguration,
    GlobalConfiguration,
    RenderNodesConfiguration,
    SceneObjectConfiguration,
    TextureConfiguration {
  config: Types.GameObjects.Particles.ParticleEmitterConfig;
}
