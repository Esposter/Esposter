import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { BlendModeConfiguration } from "#src/models/configuration/components/BlendModeConfiguration";
import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { MaskConfiguration } from "#src/models/configuration/components/MaskConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { ScrollFactorConfiguration } from "#src/models/configuration/components/ScrollFactorConfiguration";
import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { VisibleConfiguration } from "#src/models/configuration/components/VisibleConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { GameObjects } from "phaser";

export type ShapeConfiguration = AlphaSingleConfiguration &
  BlendModeConfiguration &
  DepthConfiguration &
  GlobalConfiguration &
  MaskConfiguration &
  OriginConfiguration &
  RenderNodesConfiguration &
  ScrollFactorConfiguration &
  TransformConfiguration &
  VisibleConfiguration & {
    active: GameObjects.Shape["active"];
    displayHeight: GameObjects.Shape["displayHeight"];
    displayWidth: GameObjects.Shape["displayWidth"];
    fillAlpha: GameObjects.Shape["fillAlpha"];
    fillColor: GameObjects.Shape["fillColor"];
    strokeStyle: Parameters<GameObjects.Shape["setStrokeStyle"]>;
  };
