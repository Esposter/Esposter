import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyle } from "@/models/ui/UiStyle";

export const UiStyleIconMeaningMap = {
  [UiStyle.Standard]: UiIconMeaning.StandardStyle,
  [UiStyle.Voxel]: UiIconMeaning.VoxelStyle,
} as const satisfies Record<UiStyle, UiIconMeaning>;
