import { type BaseShapeConfiguration } from "@/lib/phaser/models/configuration/shared/ShapeConfiguration";
import { type AlphaSingleEventEmitsOptions } from "@/lib/phaser/models/emit/components/AlphaSingleEventEmitsOptions";
import { type BlendModeEventEmitsOptions } from "@/lib/phaser/models/emit/components/BlendModeEventEmitsOptions";
import { type DepthEventEmitsOptions } from "@/lib/phaser/models/emit/components/DepthEventEmitsOptions";
import { type MaskEventEmitsOptions } from "@/lib/phaser/models/emit/components/MaskEventEmitsOptions";
import { type OriginEventEmitsOptions } from "@/lib/phaser/models/emit/components/OriginEventEmitsOptions";
import { type PipelineEventEmitsOptions } from "@/lib/phaser/models/emit/components/PipelineEventEmitsOptions";
import { type ScrollFactorEventEmitsOptions } from "@/lib/phaser/models/emit/components/ScrollFactorEventEmitsOptions";
import { type TransformEventEmitsOptions } from "@/lib/phaser/models/emit/components/TransformEventEmitsOptions";
import { type VisibleEventEmitsOptions } from "@/lib/phaser/models/emit/components/VisibleEventEmitsOptions";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

type BaseShapeEventEmitsOptions = {
  [P in UpdateEvent<keyof BaseShapeConfiguration>]: [BaseShapeConfiguration[ExtractUpdateEvent<P>]?];
};

export type ShapeEventEmitsOptions = AlphaSingleEventEmitsOptions &
  BlendModeEventEmitsOptions &
  DepthEventEmitsOptions &
  MaskEventEmitsOptions &
  OriginEventEmitsOptions &
  PipelineEventEmitsOptions &
  ScrollFactorEventEmitsOptions &
  TransformEventEmitsOptions &
  VisibleEventEmitsOptions &
  BaseShapeEventEmitsOptions;
