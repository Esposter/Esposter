import type { IdMap } from "#src/models/cutover/IdMap";
import type { LegacyScheduledJob } from "#src/models/cutover/LegacyScheduledJob";
import type { TableParents } from "#src/models/cutover/TableParents";
import type { RoomImport } from "@esposter/db-schema";

import { ScheduledMessageJobType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export interface RoomScheduledMessagesSource {
  // The number a message was given in its room, by its row key, or undefined when it has none
  getNumber: (rowKey: string) => number | undefined;
  idMap: Pick<IdMap, "newIdOf" | "rewrite">;
  jobs: LegacyScheduledJob[];
  parents: TableParents;
  roomId: string;
}

// A room's pending scheduled messages as its object imports them, under the ids assign-ids gave their job rows. A reply
// Names its root by the number the root's row key was given, and one whose root was never numbered is sent to the room
// Itself. A job whose sender is gone is dropped, as the cascade that removed the sender would have dropped it
export const toRoomScheduledMessages = ({
  getNumber,
  idMap,
  jobs,
  parents,
  roomId,
}: RoomScheduledMessagesSource): RoomImport["scheduledMessages"] =>
  jobs.flatMap(({ id: oldId, payload, roomId: roomOldId, runAt, userId: oldUserId }) => {
    if (payload.type !== ScheduledMessageJobType.ScheduledMessage || idMap.newIdOf(roomOldId) !== roomId) return [];
    const userId = idMap.rewrite(oldUserId);
    if (!parents.userIds.has(userId)) return [];
    const id = idMap.newIdOf(oldId);
    if (id === undefined)
      throw new InvalidOperationError(Operation.Read, oldId, "has no new id: assign-ids must run first");
    return [
      {
        id,
        message: idMap.rewrite(payload.message),
        replyToId: payload.replyRowKey === "" ? null : (getNumber(payload.replyRowKey) ?? null),
        runAt,
        userId,
      },
    ];
  });
