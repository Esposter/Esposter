import { PaletteColor } from "@/models/agentConsole/PaletteColor";
// A dusk palette the page owns outright: nothing here follows the app's theme, and nothing outside the page reads it
export const AgentConsolePaletteMap = {
  [PaletteColor.Accent]: "#e0a458",
  [PaletteColor.Background]: "#16161e",
  [PaletteColor.Book]: "#b5485d",
  [PaletteColor.Cloth]: "#3d7dca",
  [PaletteColor.Error]: "#e56b6f",
  [PaletteColor.Floor]: "#3b3553",
  [PaletteColor.Info]: "#7fb7e6",
  [PaletteColor.Muted]: "#9a8c98",
  [PaletteColor.Panel]: "#221f33",
  [PaletteColor.PanelEdge]: "#5c5470",
  [PaletteColor.Portal]: "#8e6fd8",
  [PaletteColor.Screen]: "#5ec8a0",
  [PaletteColor.Skin]: "#f1c8a3",
  [PaletteColor.Stone]: "#6c6a7c",
  [PaletteColor.SubagentCloth]: "#c77dba",
  [PaletteColor.Success]: "#5ec8a0",
  [PaletteColor.Text]: "#f2e9e4",
  [PaletteColor.Wall]: "#4a4e69",
  [PaletteColor.Warning]: "#f4d35e",
  [PaletteColor.Wood]: "#8d6e4f",
} as const satisfies Record<PaletteColor, string>;
