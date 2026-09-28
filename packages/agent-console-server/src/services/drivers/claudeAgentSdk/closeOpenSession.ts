import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { SessionOpenerContext } from "#src/models/claudeAgentSdk/SessionOpenerContext";

import { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import { toSessionClosedEvents } from "#src/services/drivers/claudeAgentSdk/toSessionClosedEvents";

// Takes a session off the host at once: its waiting permission requests are denied, its state becomes closed, and
// It leaves the map — so a resume issued straight after reopens it rather than finding the one still winding down.
// A reopened session under the same id, a rewind, has already replaced this one in the map, and is left alone
export const closeOpenSession = (
  sessionId: string,
  openSession: OpenSession,
  message: string,
  {
    emit,
    onSessionsChange,
    openSessionMap,
  }: Pick<SessionOpenerContext, "emit" | "onSessionsChange" | "openSessionMap">,
): void => {
  if (openSessionMap.get(sessionId) !== openSession) return;

  for (const pendingPermission of openSession.pendingPermissionMap.values())
    pendingPermission.settle(PermissionBehavior.Deny, "");
  emit(sessionId, toSessionClosedEvents(message));
  openSessionMap.delete(sessionId);
  onSessionsChange();
};
