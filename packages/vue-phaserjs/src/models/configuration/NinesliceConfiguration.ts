import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface NinesliceConfiguration
  extends
    AlphaSingleConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    Except<Types.GameObjects.NineSlice.NineSliceConfig, "frame" | keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    TextureConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
