import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { createRoom } from "@/services/message/room/createRoom.test";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe } from "vitest";

export const createScheduledMessageJob = (
  overrides: Partial<ScheduledMessageJobWithRoom> = {},
): ScheduledMessageJobWithRoom => {
  const room = overrides.room ?? createRoom("name");
  return {
    id: v7(),
    payload: { message: "message", replyToId: null, type: ScheduledMessageJobType.ScheduledMessage },
    room,
    roomId: room.id,
    runAt: new Date(0),
    ...overrides,
  };
};

describe.todo("createScheduledMessageJob");
