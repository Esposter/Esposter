import type { UserEvent } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getResultAsync, noop } from "@esposter/shared";

// A room-list event a write of the room raised, sent through the room to each member it has online, and on through
// each member's own object to every tab they have open. Settled on its own, so a failure costs the online members the
// event and never the write that raised it
export const notifyOnlineRoomMembers = (roomId: string, event: UserEvent): Promise<void> =>
  getResultAsync(() => useRoomObject(roomId).notifyOnlineMembers(event)).match(noop, (error) => {
    console.error("A room-list event failed to reach the room's online members", { error, roomId });
  });
