// The voxel world's palette, which it indexes its voxels by and paints as vertex colours
export enum PaletteColor {
  Accent = "accent",
  Background = "background",
  Book = "book",
  Cloth = "cloth",
  Dirt = "dirt",
  Error = "error",
  Floor = "floor",
  Grass = "grass",
  Info = "info",
  Muted = "muted",
  Panel = "panel",
  PanelEdge = "panel-edge",
  Portal = "portal",
  Rug = "rug",
  Screen = "screen",
  Skin = "skin",
  Stone = "stone",
  SubagentCloth = "subagent-cloth",
  Success = "success",
  Text = "text",
  Torch = "torch",
  Wall = "wall",
  Warning = "warning",
  Wood = "wood",
}

export const PaletteColors = Object.values(PaletteColor);
