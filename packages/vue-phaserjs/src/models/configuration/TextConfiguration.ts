import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export type TextConfiguration = AlphaConfiguration &
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
  VisibleConfiguration & {
    text: string;
  };
