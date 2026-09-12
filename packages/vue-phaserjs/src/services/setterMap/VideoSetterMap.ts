import type { VideoConfiguration } from "#src/models/configuration/VideoConfiguration";
import type { VideoEventEmitsOptions } from "#src/models/emit/VideoEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TextureCropSetterMap } from "#src/services/setterMap/components/TextureCropSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";

export const VideoSetterMap: SetterMap<VideoConfiguration, GameObjects.Video, VideoEventEmitsOptions> = {
  key: (gameObject) => (value) => {
    if (!value) return;
    gameObject.changeSource(value);
  },
  muted: (gameObject) => (value) => {
    gameObject.setMute(value);
  },
  volume: (gameObject) => (value) => {
    gameObject.setVolume(value);
  },
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
};
