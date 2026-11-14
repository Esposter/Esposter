import type { RoomImport } from "@esposter/db-schema";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The pending scheduled messages of a room have no source the copy can read.
// The realtime change removed the D1 table that held the scheduled-job rows, and those rows live in Postgres, where no reader here copies them yet.
// The room is refused rather than imported without them, so the copy stops before any room's import is written.
// Until a reader of the Postgres job rows exists, this is the one place a room's scheduled messages would come from
export const readScheduledRoomMessages = (roomId: string): RoomImport["scheduledMessages"] => {
  throw new InvalidOperationError(
    Operation.Read,
    roomId,
    "has pending scheduled messages the copy cannot read yet: their job rows are in Postgres, and nothing here copies them",
  );
};
