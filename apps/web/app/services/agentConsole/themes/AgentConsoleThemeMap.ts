import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { GENSHIN_CHARACTER_LINE_PREFIX } from "@/services/agentConsole/constants";
import { notifyWhenHidden } from "@/services/agentConsole/notifyWhenHidden";

const defaultTheme: AgentConsoleTheme = {
  getAvatar: () => "",
  reactions: {
    [AgentConsoleReaction.AttentionNeeded]: (title, body) => {
      notifyWhenHidden(title, body);
    },
    [AgentConsoleReaction.TurnEnded]: (title, body) => {
      notifyWhenHidden(title, body);
    },
  },
};
// The theme registry. The default is the voxel world with no character in it, and a notification when a turn ends or
// Wants attention while the tab is hidden. The Genshin theme presents a session the persona plugin started as its
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
