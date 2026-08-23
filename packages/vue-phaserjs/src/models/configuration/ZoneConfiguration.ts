import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { GameObjects, Types } from "phaser";
import type { Except } from "type-fest";

export interface ZoneConfiguration
  extends
    DepthConfiguration,
    Except<Types.GameObjects.Zone.ZoneConfig, keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    OriginConfiguration,
    ScrollFactorConfiguration,
    TransformConfiguration,
    VisibleConfiguration {
  displayHeight: GameObjects.Zone["displayHeight"];
  displayWidth: GameObjects.Zone["displayWidth"];
}
