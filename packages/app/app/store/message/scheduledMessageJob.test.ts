// @vitest-environment nuxt
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { MimeCategory, RoomType, ScheduledMessageJobType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useScheduledMessageJobStore, () => {
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const room: RoomInMessage = {
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    categoryId: null,
    createdAt,
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "",
    isReadOnly: false,
    maxFileSizeBytes: null,
    name: "name",
    participantKey: null,
    slowmodeMs: null,
    topic: "",
    type: RoomType.Room,
    updatedAt: createdAt,
    userId,
  };
  const createScheduledMessageJob = (jobId: string): ScheduledMessageJobInMessageWithRoom => ({
    cancelledAt: null,
    completedAt: null,
    createdAt,
    deletedAt: null,
    id: jobId,
    payload: { message, type: ScheduledMessageJobType.ScheduledMessage },
    processingStartedAt: null,
    room,
    roomId: room.id,
    runAt: createdAt,
    updatedAt: createdAt,
    userId,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("drops a cancelled job from the loaded page", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const { removeScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id), createScheduledMessageJob(otherId)];
    count.value = 2;
    removeScheduledMessageJob(id);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(count.value).toBe(1);
  });

  // The badge counts every scheduled job the user has, not just the page on screen, so a cancel of a job this
  // Page never held must leave it alone — decremented anyway, the tab reads one job short of the truth
  test("leaves the badge count alone for a job the page never held", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const { removeScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id)];
    count.value = 2;
    removeScheduledMessageJob(otherId);

    expect(items.value).toHaveLength(1);
    expect(count.value).toBe(2);
  });
});
