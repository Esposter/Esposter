import type { VideoConfiguration } from "#src/models/configuration/VideoConfiguration";
import type { VideoEventEmitsOptions } from "#src/models/emit/VideoEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { TextureCropSetterMap } from "#src/services/setterMap/components/TextureCropSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

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
  ...SceneObjectSetterMap,
  ...FlipSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...TextureCropSetterMap,
  ...TintSetterMap,
  ...GlobalSetterMap,
};
