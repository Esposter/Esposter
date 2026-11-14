import type { IdMap } from "#src/models/cutover/IdMap";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";

// Numbers a room's messages by their row keys, in the createdAt order the reverse-ticked key carries. A message keeps the
// Number it has, so assign-ids and the room import can both number a room and agree
export const numberRoomMessages = (idMap: IdMap, roomId: string, rowKeys: string[]): void => {
  idMap.numberMessages(
    roomId,
    rowKeys.map((rowKey) => ({ createdAt: new Date(getReverseTickedMilliseconds(rowKey)), rowKey })),
  );
};
