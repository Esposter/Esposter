import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";

export interface RenderableConfiguration
  extends
    AlphaConfiguration,
    GlobalConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    SceneObjectConfiguration,
    TintConfiguration {}
