import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { createRoom } from "@/services/message/room/createRoom.test";
import { ScheduledMessageJobType } from "@esposter/db-schema";
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
    id: crypto.randomUUID(),
    payload: { message: "message", replyRowKey: "", type: ScheduledMessageJobType.ScheduledMessage },
    processingStartedAt: null,
    room,
    roomId: room.id,
    runAt: new Date(0),
    updatedAt: new Date(0),
    userId: crypto.randomUUID(),
    ...overrides,
  };
};

describe.todo("createScheduledMessageJob");
