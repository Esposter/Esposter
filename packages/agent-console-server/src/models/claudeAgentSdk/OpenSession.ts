import type { InputQueue } from "#src/models/claudeAgentSdk/InputQueue";
import type { PendingPermission } from "#src/models/claudeAgentSdk/PendingPermission";
import type { SdkMessageMapper } from "#src/models/claudeAgentSdk/SdkMessageMapper";
import type { SessionState } from "#src/models/session/SessionState";
import type { Query, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

// A session the host holds a query open for. Every other session is a transcript on disk until it is resumed.
export interface OpenSession {
  cwd: string;
  input: InputQueue<SDKUserMessage>;
  lastActivityAt: Date;
  mapper: SdkMessageMapper;
  // The SDK's permission callbacks still waiting on a verdict, keyed by request id — each settles exactly once,
  // By a verdict or by the SDK abandoning the request
  pendingPermissionMap: Map<string, PendingPermission>;
  query: Query;
  state: SessionState;
  title: string;
}
