import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiStyle } from "#src/models/ui/UiStyle";

export const UiStyleIconMeaningMap = {
  [UiStyle.Standard]: UiIconMeaning.StandardStyle,
  [UiStyle.Voxel]: UiIconMeaning.VoxelStyle,
} as const satisfies Record<UiStyle, UiIconMeaning>;
