import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { UiToken } from "@/models/ui/UiToken";
import { GENSHIN_CHARACTER_LINE_PREFIX, GENSHIN_ELEMENT_LINE_PREFIX } from "@/services/agentConsole/constants";
import { ElementColorMap } from "genshin-text";

const defaultTheme: AgentConsoleTheme = { getAvatar: () => "", getPalette: () => ({}), reactions: {} };
// The theme registry. The default is the world with no character in it and no reactions of its own; the console
// Notifies a hidden tab for every theme. The Genshin theme presents a session the persona plugin started as its
// Character, found on the plugin's own line rather than in the prose of its card
export const AgentConsoleThemeMap = {
  [AgentConsoleThemeType.Default]: defaultTheme,
  [AgentConsoleThemeType.Genshin]: {
    ...defaultTheme,
    getAvatar: (sessionStartContext) =>
      sessionStartContext
        .split("\n")
        .find((line) => line.startsWith(GENSHIN_CHARACTER_LINE_PREFIX))
        ?.slice(GENSHIN_CHARACTER_LINE_PREFIX.length) ?? "",
    getPalette: (sessionStartContext) => {
      const element = sessionStartContext
        .split("\n")
        .find((line) => line.startsWith(GENSHIN_ELEMENT_LINE_PREFIX))
        ?.slice(GENSHIN_ELEMENT_LINE_PREFIX.length);
      const accent = element ? ElementColorMap[element] : undefined;
      return accent ? { [UiToken.Accent]: accent } : {};
    },
  },
} as const satisfies Record<AgentConsoleThemeType, AgentConsoleTheme>;
