import type { AlphaConfiguration } from "@/lib/phaser/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import type { ComputedSizeConfiguration } from "@/lib/phaser/models/configuration/components/ComputedSizeConfiguration";
import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "@/lib/phaser/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "@/lib/phaser/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import type { PipelineConfiguration } from "@/lib/phaser/models/configuration/components/PipelineConfiguration";
import type { ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import type { TintConfiguration } from "@/lib/phaser/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export type TextConfiguration = {
  text: string;
} & AlphaConfiguration &
  BlendModeConfiguration &
  ComputedSizeConfiguration &
  DepthConfiguration &
  Except<Types.GameObjects.Text.TextConfig, keyof Types.GameObjects.GameObjectConfig> &
  FlipConfiguration &
  GlobalConfiguration &
  MaskConfiguration &
  OriginConfiguration &
  PipelineConfiguration &
  ScrollFactorConfiguration &
  TintConfiguration &
  TransformConfiguration &
  VisibleConfiguration;
