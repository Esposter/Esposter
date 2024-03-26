import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import type { ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { Except } from "@/util/types/Except";
import type { GameObjects, Types } from "phaser";

export type ZoneConfiguration = Except<Types.GameObjects.Zone.ZoneConfig, keyof Types.GameObjects.GameObjectConfig> & {
  displayWidth: GameObjects.Zone["displayWidth"];
  displayHeight: GameObjects.Zone["displayHeight"];
} & DepthConfiguration &
  OriginConfiguration &
  TransformConfiguration &
  ScrollFactorConfiguration &
  VisibleConfiguration &
  GlobalConfiguration;
