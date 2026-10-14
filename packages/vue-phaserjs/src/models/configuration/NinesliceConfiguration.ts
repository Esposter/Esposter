import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface NinesliceConfiguration
  extends
    AlphaSingleConfiguration,
    Except<Types.GameObjects.NineSlice.NineSliceConfig, "frame" | keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    SceneObjectConfiguration,
    TextureConfiguration {}
