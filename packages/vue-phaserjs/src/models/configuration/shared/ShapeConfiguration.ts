import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";
import type { GameObjects } from "phaser";

export interface ShapeConfiguration
  extends
    AlphaSingleConfiguration,
    GlobalConfiguration,
    OriginConfiguration,
    Pick<GameObjects.Shape, "displayHeight" | "displayWidth" | "fillAlpha" | "fillColor">,
    RenderNodesConfiguration,
    SceneObjectConfiguration {
  strokeStyle: Parameters<GameObjects.Shape["setStrokeStyle"]>;
}
