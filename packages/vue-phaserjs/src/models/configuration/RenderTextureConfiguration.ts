import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";

export interface RenderTextureConfiguration
  extends
    AlphaConfiguration,
    FlipConfiguration,
    GlobalConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    SceneObjectConfiguration,
    SizeConfiguration,
    TintConfiguration {
  height: number;
  width: number;
}
