/* eslint-disable perfectionist/sort-enums */
export enum FilterTypeHas {
  Link = "Link",
  Embed = "Embed",
  File = "File",
  Image = "Image",
  Video = "Video",
  Sound = "Sound",
  Forward = "Forward",
}

export const FilterTypeHases: readonly FilterTypeHas[] = Object.values(FilterTypeHas);
