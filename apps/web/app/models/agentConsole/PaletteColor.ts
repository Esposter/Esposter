// The console's one palette, which the panels read as CSS custom properties and the world as vertex colours
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
