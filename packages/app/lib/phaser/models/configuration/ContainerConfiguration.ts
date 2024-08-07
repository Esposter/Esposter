import type { AlphaSingleConfiguration } from "@/lib/phaser/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import type { ComputedSizeConfiguration } from "@/lib/phaser/models/configuration/components/ComputedSizeConfiguration";
import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "@/lib/phaser/models/configuration/components/MaskConfiguration";
import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export type ContainerConfiguration = AlphaSingleConfiguration &
  BlendModeConfiguration &
  ComputedSizeConfiguration &
  DepthConfiguration &
  Except<Types.GameObjects.Container.ContainerConfig, keyof Types.GameObjects.GameObjectConfig> &
  GlobalConfiguration &
  MaskConfiguration &
  TransformConfiguration &
  VisibleConfiguration;
