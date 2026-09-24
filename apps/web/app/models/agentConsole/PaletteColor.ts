// The voxel world's palette, which it indexes its voxels by and paints as vertex colours
export enum PaletteColor {
  Accent = "accent",
  Background = "background",
  Book = "book",
  Cloth = "cloth",
  Error = "error",
  Floor = "floor",
  Info = "info",
  Muted = "muted",
  Panel = "panel",
  PanelEdge = "panel-edge",
  Portal = "portal",
  Screen = "screen",
  Skin = "skin",
  Stone = "stone",
  SubagentCloth = "subagent-cloth",
  Success = "success",
  Text = "text",
  Wall = "wall",
  Warning = "warning",
  Wood = "wood",
}

export const PaletteColors = Object.values(PaletteColor);
