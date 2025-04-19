import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { SizeConfiguration } from "@/models/configuration/components/SizeConfiguration";
import type { TextureConfiguration } from "@/models/configuration/components/TextureConfiguration";
import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { AnimationConfiguration } from "@/models/configuration/shared/AnimationConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface SpriteConfiguration
  extends AlphaConfiguration,
    AnimationConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    Except<Types.GameObjects.Sprite.SpriteConfig, "anims" | "frame" | keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    PipelineConfiguration,
    ScrollFactorConfiguration,
    SizeConfiguration,
    TextureConfiguration,
    TintConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
