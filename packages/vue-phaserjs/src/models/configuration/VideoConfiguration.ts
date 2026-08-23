import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TextureCropConfiguration } from "#src/models/configuration/components/TextureCropConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";

export interface VideoConfiguration
  extends
    AlphaConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    FlipConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    TextureCropConfiguration,
    TintConfiguration,
    TransformConfiguration,
    VisibleConfiguration {
  key: string;
  muted: boolean;
  volume: number;
}
