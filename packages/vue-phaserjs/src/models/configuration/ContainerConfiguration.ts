import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface ContainerConfiguration
  extends AlphaSingleConfiguration,
    BlendModeConfiguration,
    ComputedSizeConfiguration,
    DepthConfiguration,
    Except<Types.GameObjects.Container.ContainerConfig, keyof Types.GameObjects.GameObjectConfig>,
    GlobalConfiguration,
    MaskConfiguration,
    ScrollFactorConfiguration,
    TransformConfiguration,
    VisibleConfiguration {}
