// @unocss-include
import { FilterTypeHas } from "@esposter/db-schema";

export const FilterTypeHasIconMap = {
  [FilterTypeHas.Embed]: "i-mdi:file-link-outline",
  [FilterTypeHas.File]: "i-mdi:paperclip",
  [FilterTypeHas.Forward]: "i-mdi:share",
  [FilterTypeHas.Image]: "i-mdi:image-outline",
  [FilterTypeHas.Link]: "i-mdi:link-variant",
  [FilterTypeHas.Sound]: "i-mdi:volume-high",
  [FilterTypeHas.Video]: "i-mdi:video-outline",
} as const satisfies Record<FilterTypeHas, string>;
