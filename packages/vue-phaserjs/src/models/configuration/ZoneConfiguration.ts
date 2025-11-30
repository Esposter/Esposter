import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
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
