import { PaletteColors } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
// The palette as custom properties on the page's root, so every panel reads it and nothing outside the page can
export const AgentConsolePaletteStyle = Object.fromEntries(
  PaletteColors.map((paletteColor) => [`--agent-console-${paletteColor}`, AgentConsolePaletteMap[paletteColor]]),
);
