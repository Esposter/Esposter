import type { MenuItem } from "@/models/agentConsole/MenuItem";
// The panels that open over the world, each holding the full detail of what an object in it shows
export enum AgentConsolePanelType {
  Changes = "Changes",
  Sessions = "Sessions",
  Timeline = "Timeline",
  Usage = "Usage",
}

export const AgentConsolePanelMenuItems = Object.values(AgentConsolePanelType).map(
  (value): MenuItem<AgentConsolePanelType> => ({ title: value, value }),
);
