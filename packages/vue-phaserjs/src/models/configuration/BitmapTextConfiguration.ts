import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { GameObjects } from "phaser";

export interface BitmapTextConfiguration
  extends
    AlphaConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    OriginConfiguration,
    Pick<
      GameObjects.BitmapText,
      "align" | "font" | "fontSize" | "letterSpacing" | "lineSpacing" | "text" | "wordWrapCharCode"
    >,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    TintConfiguration,
    TransformConfiguration,
    VisibleConfiguration {
  dropShadow: Parameters<GameObjects.BitmapText["setDropShadow"]>;
  maxWidth: Parameters<GameObjects.BitmapText["setMaxWidth"]>[0];
}
