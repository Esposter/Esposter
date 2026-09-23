import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { UiTheme } from "@/models/ui/UiTheme";
import { UiToken } from "@/models/ui/UiToken";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";

const DuskPalette = UiPaletteMap[UiTheme.Dusk];
// The voxel world's palette: its materials, beside the interface colours it paints with, taken from the dusk tokens the
// Page is scoped to, so the room and the panels over it agree. The panels read the tokens themselves
export const AgentConsolePaletteMap = {
  [PaletteColor.Accent]: DuskPalette[UiToken.Accent],
  [PaletteColor.Background]: DuskPalette[UiToken.Background],
  [PaletteColor.Book]: "#b5485d",
  [PaletteColor.Cloth]: "#3d7dca",
  [PaletteColor.Dirt]: "#6b4e3d",
  [PaletteColor.Error]: DuskPalette[UiToken.Error],
  [PaletteColor.Floor]: "#3b3553",
  [PaletteColor.Grass]: "#4d7a4f",
  [PaletteColor.Info]: DuskPalette[UiToken.Info],
  [PaletteColor.Muted]: DuskPalette[UiToken.Muted],
  [PaletteColor.Panel]: DuskPalette[UiToken.Panel],
  [PaletteColor.PanelEdge]: DuskPalette[UiToken.PanelEdge],
  [PaletteColor.Portal]: "#8e6fd8",
  [PaletteColor.Screen]: "#5ec8a0",
  [PaletteColor.Skin]: "#f1c8a3",
  [PaletteColor.Stone]: "#6c6a7c",
  [PaletteColor.SubagentCloth]: "#c77dba",
  [PaletteColor.Success]: DuskPalette[UiToken.Success],
  [PaletteColor.Text]: DuskPalette[UiToken.Text],
  [PaletteColor.Wall]: "#4a4e69",
  [PaletteColor.Warning]: DuskPalette[UiToken.Warning],
  [PaletteColor.Wood]: "#8d6e4f",
} as const satisfies Record<PaletteColor, string>;
