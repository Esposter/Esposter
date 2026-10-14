import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";

// The configurations every scene object takes, which each object's own configuration extends
export interface SceneObjectConfiguration
  extends
    BlendModeConfiguration,
    DepthConfiguration,
    MaskConfiguration,
    ScrollFactorConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
