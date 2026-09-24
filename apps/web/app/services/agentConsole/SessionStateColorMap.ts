import { SessionState } from "agent-console-server/contracts";
// The session's state as the colour its label takes: waiting on the person stands out, a closed one recedes
export const SessionStateColorMap = {
  [SessionState.Closed]: "var(--ui-muted)",
  [SessionState.Compacting]: "var(--ui-info)",
  [SessionState.Idle]: "var(--ui-success)",
  [SessionState.RequiresAction]: "var(--ui-warning)",
  [SessionState.Running]: "var(--ui-accent)",
} as const satisfies Record<SessionState, string>;
