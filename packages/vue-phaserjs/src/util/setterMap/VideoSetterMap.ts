import type { VideoConfiguration } from "@/models/configuration/VideoConfiguration";
import type { VideoEventEmitsOptions } from "@/models/emit/VideoEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TextureCropSetterMap } from "@/util/setterMap/components/TextureCropSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const VideoSetterMap: SetterMap<VideoConfiguration, GameObjects.Video, VideoEventEmitsOptions> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TextureCropSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
  key: (gameObject) => (value) => {
    if (!value) return;
    gameObject.changeSource(value);
  },
  muted: (gameObject) => (value) => gameObject.setMute(value),
  volume: (gameObject) => (value) => gameObject.setVolume(value),
};
