import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "@/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { SizeConfiguration } from "@/models/configuration/components/SizeConfiguration";
import type { TextureCropConfiguration } from "@/models/configuration/components/TextureCropConfiguration";
import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface ImageConfiguration
  extends AlphaConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    Except<Types.GameObjects.Sprite.SpriteConfig, "frame" | keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    SizeConfiguration,
    TextureCropConfiguration,
    TintConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
