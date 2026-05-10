import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "@/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
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
