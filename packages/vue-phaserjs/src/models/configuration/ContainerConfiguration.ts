import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface ContainerConfiguration
  extends
    AlphaSingleConfiguration,
    Except<Types.GameObjects.Container.ContainerConfig, keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    SceneObjectConfiguration {}
