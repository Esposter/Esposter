import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";

export const AgentConsolePanelMenuItems = [
  AgentConsolePanelType.Conversation,
  AgentConsolePanelType.Sessions,
  AgentConsolePanelType.Timeline,
  AgentConsolePanelType.Changes,
  AgentConsolePanelType.Usage,
].map((value): UiMenuItem<AgentConsolePanelType> => ({ title: value, value }));
