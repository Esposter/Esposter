// @vitest-environment nuxt
import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";

import { useReadModerationLog } from "#src/composables/message/moderation/useReadModerationLog";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { createEmptyPage } from "@esposter/db-schema";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadModerationLog, () => {
  const { trpcMsw } = setupMswTrpc();

  // A filter's read is issued after the first one landed, so the list must draw that read's state and not the first's
  test("is pending while a filtered read is out", async () => {
    expect.hasAssertions();

    const filteredRead = Promise.withResolvers<ReturnType<typeof createEmptyPage<ModerationLogInRoom>>>();
    trpcMsw.message.moderation.readModerationLog.query(({ input }) =>
      input.actorUserId ? filteredRead.promise : createEmptyPage<ModerationLogInRoom>(),
    );
    const filters = ref({ actorUserId: "", targetUserId: "", type: "" as const });
    const { isPending, readModerationLog } = useReadModerationLog(v7(), () => filters.value);
    await readModerationLog();

    expect(isPending.value).toBe(false);

    filters.value = { ...filters.value, actorUserId: v7() };
    const filteredReadOut = readModerationLog();
    await flushPromises();

    expect(isPending.value).toBe(true);

    filteredRead.resolve(createEmptyPage<ModerationLogInRoom>());
    await filteredReadOut;

    expect(isPending.value).toBe(false);
  });
});
