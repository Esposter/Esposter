import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TextureConfiguration } from "@/models/configuration/components/TextureConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface NineSliceConfiguration
  extends AlphaSingleConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    Except<Types.GameObjects.NineSlice.NineSliceConfig, "frame" | keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    PipelineConfiguration,
    ScrollFactorConfiguration,
    TextureConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
