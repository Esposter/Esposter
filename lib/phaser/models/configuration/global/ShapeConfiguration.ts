import { type AlphaSingleConfiguration } from "@/lib/phaser/models/configuration/components/AlphaSingleConfiguration";
import { type BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import { type DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import { type MaskConfiguration } from "@/lib/phaser/models/configuration/components/MaskConfiguration";
import { type OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import { type PipelineConfiguration } from "@/lib/phaser/models/configuration/components/PipelineConfiguration";
import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import { type TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import { type VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import { type GameObjects } from "phaser";

export type ShapeConfiguration = AlphaSingleConfiguration &
  BlendModeConfiguration &
  DepthConfiguration &
  MaskConfiguration &
  OriginConfiguration &
  PipelineConfiguration &
  ScrollFactorConfiguration &
  TransformConfiguration &
  VisibleConfiguration & {
    active?: GameObjects.Shape["active"];
    displayWidth?: GameObjects.Shape["displayWidth"];
    displayHeight?: GameObjects.Shape["displayHeight"];
    fillColor?: GameObjects.Shape["fillColor"];
    fillAlpha?: GameObjects.Shape["fillAlpha"];
  };
