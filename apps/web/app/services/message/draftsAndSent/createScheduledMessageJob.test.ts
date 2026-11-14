import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { createRoom } from "@/services/message/room/createRoom.test";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe } from "vitest";

export const createScheduledMessageJob = (
  overrides: Partial<ScheduledMessageJobInMessageWithRoom> = {},
): ScheduledMessageJobInMessageWithRoom => {
  const room = overrides.room ?? createRoom("name");
  return {
    cancelledAt: null,
    completedAt: null,
    createdAt: new Date(0),
    deletedAt: null,
    id: v7(),
    payload: { message: "message", replyToId: null, type: ScheduledMessageJobType.ScheduledMessage },
    processingStartedAt: null,
    room,
    roomId: room.id,
    runAt: new Date(0),
    updatedAt: new Date(0),
    userId: v7(),
    ...overrides,
  };
};

describe.todo("createScheduledMessageJob");
