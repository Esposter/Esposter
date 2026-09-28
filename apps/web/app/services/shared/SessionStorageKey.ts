// Central registry for every sessionStorage key, so keys can never overlap. What is kept here is one tab's and outlives
// Only its reloads, where a localStorage key would also move every other tab open on the page
export const SessionStorageKey = {
  // The console's draft, so a reload never throws away what was being typed
  AgentConsoleComposerText: "agent-console-composer-text",
  // Whether the console is open, and on which tab, so a reload puts the reader back where they were
  IsAgentConsoleOpen: "agent-console-open",
  AgentConsolePanelType: "agent-console-panel-type",
  // The session this tab shows, so a reload opens it again once its host replays it
  AgentConsoleSessionId: "agent-console-session-id",
} as const;
