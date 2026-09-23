import type { UiMenuItem } from "@/models/ui/UiMenuItem";
// The console's tabs: the conversation with its composer first, then the full detail of what each object in the world
// Shows
export enum AgentConsolePanelType {
  Changes = "Changes",
  Conversation = "Conversation",
  Sessions = "Sessions",
  Timeline = "Timeline",
  Usage = "Usage",
}

export const AgentConsolePanelMenuItems = [
  AgentConsolePanelType.Conversation,
  AgentConsolePanelType.Sessions,
  AgentConsolePanelType.Timeline,
  AgentConsolePanelType.Changes,
  AgentConsolePanelType.Usage,
].map((value): UiMenuItem<AgentConsolePanelType> => ({ title: value, value }));
