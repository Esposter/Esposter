import type { AdminActionType } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getResultAsync, noop } from "@esposter/shared";

// The action a member took against another member, sent to that member's own sockets in the room. It is best-effort
// Behind the action, which has already landed: a failed broadcast costs the target the notice, never the action
export const broadcastAdminAction = (
  roomId: string,
  { durationMs, targetUserId, type }: { durationMs?: number; targetUserId: string; type: AdminActionType },
) =>
  getResultAsync(() =>
    useRoomObject(roomId).broadcastEvent(
      { data: { durationMs, roomId, targetUserId, type }, type: "adminAction" },
      { tag: `user:${targetUserId}` },
    ),
  ).match(noop, console.error);
