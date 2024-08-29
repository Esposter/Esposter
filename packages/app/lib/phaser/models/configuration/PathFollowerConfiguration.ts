import type { AlphaConfiguration } from "@/lib/phaser/models/configuration/components/AlphaConfiguration";
import type { BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { FlipConfiguration } from "@/lib/phaser/models/configuration/components/FlipConfiguration";
import type { MaskConfiguration } from "@/lib/phaser/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import type { PathFollowerComponentConfiguration } from "@/lib/phaser/models/configuration/components/PathFollowerComponentConfiguration";
import type { PipelineConfiguration } from "@/lib/phaser/models/configuration/components/PipelineConfiguration";
import type { ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import type { SizeConfiguration } from "@/lib/phaser/models/configuration/components/SizeConfiguration";
import type { TextureConfiguration } from "@/lib/phaser/models/configuration/components/TextureConfiguration";
import type { TintConfiguration } from "@/lib/phaser/models/configuration/components/TintConfiguration";
import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import type { Types } from "phaser";

export type PathFollowerConfiguration = AlphaConfiguration &
  BlendModeConfiguration &
  DepthConfiguration &
  FlipConfiguration &
  GlobalConfiguration &
  MaskConfiguration &
  OriginConfiguration &
  PathFollowerComponentConfiguration &
  PipelineConfiguration &
  ScrollFactorConfiguration &
  SizeConfiguration &
  TextureConfiguration &
  TintConfiguration &
  TransformConfiguration &
  Types.GameObjects.PathFollower.PathConfig &
  VisibleConfiguration;
