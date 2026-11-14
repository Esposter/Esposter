import type { IdMap } from "#src/models/cutover/IdMap";
import type { LegacyScheduledJob } from "#src/models/cutover/LegacyScheduledJob";
import type { RescheduleRequest } from "#src/models/cutover/RescheduleRequest";
import type { TableParents } from "#src/models/cutover/TableParents";

import { ScheduledMessageJobType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The pending message reminders under the ids assign-ids gave their job rows. One whose room or owner is gone is dropped,
// As the cascade that removed it would have dropped the job
export const toRescheduleReminders = (
  jobs: LegacyScheduledJob[],
  idMap: Pick<IdMap, "newIdOf" | "rewrite">,
  parents: TableParents,
): RescheduleRequest["reminders"] =>
  jobs.flatMap(({ id: oldId, payload, roomId: roomOldId, runAt, userId: oldUserId }) => {
    if (payload.type !== ScheduledMessageJobType.Reminder) return [];
    const roomId = idMap.newIdOf(roomOldId);
    const userId = idMap.rewrite(oldUserId);
    if (roomId === undefined || !parents.roomIds.has(roomId) || !parents.userIds.has(userId)) return [];
    const id = idMap.newIdOf(oldId);
    if (id === undefined)
      throw new InvalidOperationError(Operation.Read, oldId, "has no new id: assign-ids must run first");
    return [{ id, roomId, runAt, text: idMap.rewrite(payload.text), userId }];
  });
