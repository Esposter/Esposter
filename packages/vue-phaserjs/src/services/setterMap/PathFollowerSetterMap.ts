import type { PathFollowerConfiguration } from "#src/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "#src/models/emit/PathFollowerEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { PathFollowerComponentSetterMap } from "#src/services/setterMap/components/PathFollowerComponentSetterMap";
import { SizeSetterMap } from "#src/services/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

export const PathFollowerSetterMap: SetterMap<
  PathFollowerConfiguration,
  GameObjects.PathFollower,
  PathFollowerEventEmitsOptions
> = {
  ...RenderableSetterMap,
  ...FlipSetterMap,
  ...PathFollowerComponentSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
};
