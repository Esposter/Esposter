import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { RenderNodesConfiguration } from "@/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";

export interface GraphicsConfiguration
  extends
    AlphaSingleConfiguration,
    BlendModeConfiguration,
    DepthConfiguration,
    GlobalConfiguration,
    MaskConfiguration,
    RenderNodesConfiguration,
    ScrollFactorConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
