import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { notifyWhenHidden } from "@/services/agentConsole/notifyWhenHidden";
// The theme registry. The default is the work surface alone in the app's own Vuetify theme, and a notification when
// A turn ends or wants attention while the tab is hidden
export const AgentConsoleThemeMap = {
  [AgentConsoleThemeType.Default]: {
    reactions: {
      [AgentConsoleReaction.AttentionNeeded]: (title, body) => {
        notifyWhenHidden(title, body);
      },
      [AgentConsoleReaction.TurnEnded]: (title, body) => {
        notifyWhenHidden(title, body);
      },
    },
  },
} as const satisfies Record<AgentConsoleThemeType, AgentConsoleTheme>;
