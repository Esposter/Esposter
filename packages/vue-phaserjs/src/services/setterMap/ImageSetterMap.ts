import type { ImageConfiguration } from "#src/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "#src/models/emit/ImageEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { SizeSetterMap } from "#src/services/setterMap/components/SizeSetterMap";
import { TextureCropSetterMap } from "#src/services/setterMap/components/TextureCropSetterMap";
import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

export const ImageSetterMap: SetterMap<ImageConfiguration, GameObjects.Image, ImageEventEmitsOptions> = {
  ...RenderableSetterMap,
  ...FlipSetterMap,
  ...SizeSetterMap,
  ...TextureCropSetterMap,
};
