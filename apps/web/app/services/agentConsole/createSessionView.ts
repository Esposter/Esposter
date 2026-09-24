import type { SessionView } from "@/models/agentConsole/SessionView";

import { MAIN_LANE_TITLE } from "@/services/agentConsole/constants";

export const createSessionView = (): SessionView => ({
  conversationEvents: [],
  // Only ever asked whether it holds an id, so it is kept out of reactivity rather than proxied id by id
  eventIds: markRaw(new Set()),
  fileEditMap: new Map(),
  latestEventMap: {},
  pendingPermissionRequestMap: new Map(),
  // The main agent's lane is first under an empty id, and each subagent's joins in the order it started
  timelineLaneMap: new Map([["", { id: "", title: MAIN_LANE_TITLE, toolCalls: [] }]]),
  toolCallMap: new Map(),
});
