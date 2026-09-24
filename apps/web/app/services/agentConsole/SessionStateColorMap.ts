import { SessionState } from "agent-console-server/contracts";
// The session's state as the colour its label takes: waiting on the person stands out, a closed one recedes
export const SessionStateColorMap = {
  [SessionState.Closed]: "var(--agent-console-muted)",
  [SessionState.Compacting]: "var(--agent-console-info)",
  [SessionState.Idle]: "var(--agent-console-success)",
  [SessionState.RequiresAction]: "var(--agent-console-warning)",
  [SessionState.Running]: "var(--agent-console-accent)",
} as const satisfies Record<SessionState, string>;
