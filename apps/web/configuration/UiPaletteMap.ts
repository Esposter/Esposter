import { UiTheme } from "../app/models/ui/UiTheme";
import { UiToken } from "../app/models/ui/UiToken";
// The UI library's palette, one entry per token in each theme. The Vuetify and UnoCSS configs read it as well as the
// App, and they load before any alias resolves, so it lives beside them. Dusk is the agent console's palette as it was
// Drawn; dawn is its light twin, authored rather than computed, with the same token names so a component never knows
// Which one is selected
export const UiPaletteMap = {
  [UiTheme.Dawn]: {
    [UiToken.Accent]: "#8f4f0a",
    [UiToken.Background]: "#efe6de",
    [UiToken.Border]: "#b3a6b1",
    [UiToken.Error]: "#b0303a",
    [UiToken.Info]: "#1d5a92",
    [UiToken.Muted]: "#5f5566",
    [UiToken.Panel]: "#faf5f0",
    [UiToken.Success]: "#1c6b4c",
    [UiToken.Text]: "#221f33",
    [UiToken.Warning]: "#7a5a00",
  },
  [UiTheme.Dusk]: {
    [UiToken.Accent]: "#e0a458",
    [UiToken.Background]: "#16161e",
    [UiToken.Border]: "#5c5470",
    [UiToken.Error]: "#e56b6f",
    [UiToken.Info]: "#7fb7e6",
    [UiToken.Muted]: "#9a8c98",
    [UiToken.Panel]: "#221f33",
    [UiToken.Success]: "#5ec8a0",
    [UiToken.Text]: "#f2e9e4",
    [UiToken.Warning]: "#f4d35e",
  },
} as const satisfies Record<UiTheme, Record<UiToken, string>>;
