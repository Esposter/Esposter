import type { ConversationEvent } from "@/models/agentConsole/ConversationEvent";
import type { FileEdit } from "@/models/agentConsole/FileEdit";
import type { LatestEventMap } from "@/models/agentConsole/LatestEventMap";
import type { StreamDraft } from "@/models/agentConsole/StreamDraft";
import type { TimelineLane } from "@/models/agentConsole/TimelineLane";
import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { PermissionRequestEvent } from "agent-console-server/contracts";
// Everything the page reads off one session's log, kept up to date one event at a time so an event costs the same
// However long the session has run
export interface SessionView {
  conversationEvents: ConversationEvent[];
  // The ids already folded in: a replay after a reconnect overlaps what the page holds
  eventIds: Set<string>;
  // What each edit tool call changes, under its tool use id; a call that failed changed nothing and is dropped
  fileEditMap: Map<string, FileEdit[]>;
  // Each changed file's text before the session first changed it, under its path, where the host could say
  fileOriginMap: Map<string, string>;
  latestEventMap: LatestEventMap;
  pendingPermissionRequestMap: Map<string, PermissionRequestEvent>;
  streamDraft?: StreamDraft;
  timelineLaneMap: Map<string, TimelineLane>;
  toolCallMap: Map<string, ToolCall>;
}
