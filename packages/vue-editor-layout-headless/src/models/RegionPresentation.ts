// How a region is drawn for a size class: beside the canvas, over it, as a sheet the reader opens, or not at all
export enum RegionPresentation {
  Docked = "docked",
  Hidden = "hidden",
  Overlay = "overlay",
  Sheet = "sheet",
}
