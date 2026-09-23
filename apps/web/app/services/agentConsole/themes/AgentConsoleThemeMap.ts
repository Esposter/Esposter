import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { notifyWhenHidden } from "@/services/agentConsole/notifyWhenHidden";
// The theme registry. The default is the voxel world with no character in it, and a notification when a turn ends or
// Wants attention while the tab is hidden
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
