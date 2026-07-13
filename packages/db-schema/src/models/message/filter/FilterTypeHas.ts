/* eslint-disable perfectionist/sort-enums */
export enum FilterTypeHas {
  Link = "Link",
  Embed = "Embed",
  Image = "Image",
  Video = "Video",
  Sound = "Sound",
  Forward = "Forward",
}

export const FilterTypeHases: readonly FilterTypeHas[] = Object.values(FilterTypeHas);
