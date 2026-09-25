// @unocss-include
/* eslint-disable perfectionist/sort-objects -- follows `FilterTypeHas`'s own order */
import { FilterTypeHas } from "@esposter/db-schema";

export const FilterTypeHasIconMap = {
  [FilterTypeHas.Link]: "i-mdi:link-variant",
  [FilterTypeHas.Embed]: "i-mdi:file-link-outline",
  [FilterTypeHas.File]: "i-mdi:paperclip",
  [FilterTypeHas.Image]: "i-mdi:image-outline",
  [FilterTypeHas.Video]: "i-mdi:video-outline",
  [FilterTypeHas.Sound]: "i-mdi:volume-high",
  [FilterTypeHas.Forward]: "i-mdi:share",
} as const satisfies Record<FilterTypeHas, string>;
