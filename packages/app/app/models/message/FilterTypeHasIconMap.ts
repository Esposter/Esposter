/* eslint-disable perfectionist/sort-objects */
import { FilterTypeHas } from "@esposter/shared";

export const FilterTypeHasIconMap = {
  [FilterTypeHas.Link]: "mdi-link-variant",
  [FilterTypeHas.Embed]: "mdi-file-link-outline",
  [FilterTypeHas.Image]: "mdi-image-outline",
  [FilterTypeHas.Video]: "mdi-video-outline",
  [FilterTypeHas.Sound]: "mdi-volume-high",
  [FilterTypeHas.Forward]: "mdi-share",
} as const satisfies Record<FilterTypeHas, string>;
