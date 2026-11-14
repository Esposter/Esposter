// @vitest-environment nuxt
import type { ReadMessagesByIdsInput } from "#shared/models/db/message/ReadMessagesByIdsInput";

import { useReadMessageMetadata } from "@/composables/message/message/useReadMessageMetadata";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadMessageMetadata, () => {
  const { trpcMsw } = setupMswTrpc();
  let readMessageMetadata: ReturnType<typeof useReadMessageMetadata>;
  const roomId = v7();
  const userId = v7();

  test("reads only the replies a message names", async () => {
    expect.hasAssertions();

    const reply = createOptimisticMessage({ roomId, type: MessageType.Message }, userId);
    const replyingMessage = createOptimisticMessage({ replyToId: reply.id, roomId, type: MessageType.Message }, userId);
    const message = createOptimisticMessage({ roomId, type: MessageType.Message }, userId);
    const readMessagesByIdsInputs: ReadMessagesByIdsInput[] = [];
    trpcMsw.message.readMessagesByIds.query(({ input }) => {
      readMessagesByIdsInputs.push(input);
      return [reply];
    });
    trpcMsw.room.readUsersByIds.query(() => []);
    trpcMsw.message.emoji.readReactions.query(() => []);
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          readMessageMetadata = useReadMessageMetadata();
        },
      }),
    );
    await readMessageMetadata(roomId, [replyingMessage, message]);

    expect(readMessagesByIdsInputs).toStrictEqual([{ messageIds: [reply.id], roomId }]);
  });
});
