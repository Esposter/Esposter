import { SessionState } from "agent-console-server/contracts";
// The session's state as the colour its chip takes: waiting on the person stands out, a closed one recedes
export const SessionStateColorMap = {
  [SessionState.Closed]: "",
  [SessionState.Compacting]: "info",
  [SessionState.Idle]: "success",
  [SessionState.RequiresAction]: "warning",
  [SessionState.Running]: "primary",
} as const satisfies Record<SessionState, string>;
