import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { GENSHIN_CHARACTER_LINE_PREFIX } from "@/services/agentConsole/constants";

const defaultTheme: AgentConsoleTheme = { getAvatar: () => "", reactions: {} };
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
  },
} as const satisfies Record<AgentConsoleThemeType, AgentConsoleTheme>;
