import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import type { ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { GameObjects, Types } from "phaser";
import type { Except } from "type-fest";

export type ZoneConfiguration = {
  displayHeight: GameObjects.Zone["displayHeight"];
  displayWidth: GameObjects.Zone["displayWidth"];
} & DepthConfiguration &
  Except<Types.GameObjects.Zone.ZoneConfig, keyof Types.GameObjects.GameObjectConfig> &
  GlobalConfiguration &
  OriginConfiguration &
  ScrollFactorConfiguration &
  TransformConfiguration &
  VisibleConfiguration;
