import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";

export interface GraphicsConfiguration
  extends AlphaSingleConfiguration, GlobalConfiguration, RenderNodesConfiguration, SceneObjectConfiguration {}
