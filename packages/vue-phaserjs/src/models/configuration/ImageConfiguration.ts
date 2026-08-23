import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { TextureCropConfiguration } from "#src/models/configuration/components/TextureCropConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface ImageConfiguration
  extends
    AlphaConfiguration,
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
