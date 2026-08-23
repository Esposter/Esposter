import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";

export interface ParticlesConfiguration
  extends
    AlphaSingleConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    TextureConfiguration,
    TransformConfiguration,
    VisibleConfiguration {
  config: Types.GameObjects.Particles.ParticleEmitterConfig;
}
