/* eslint-disable perfectionist/sort-objects -- Discord's order, which the has-filter menu lists */
export const FilterTypeHas = {
  Link: "Link",
  Embed: "Embed",
  File: "File",
  Image: "Image",
  Video: "Video",
  Sound: "Sound",
  Forward: "Forward",
} as const;
export type FilterTypeHas = (typeof FilterTypeHas)[keyof typeof FilterTypeHas];

export const FilterTypeHases: readonly FilterTypeHas[] = Object.values(FilterTypeHas);
