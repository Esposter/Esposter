// @vitest-environment nuxt
import type { ReadMessagesByRowKeysInput } from "#shared/models/db/message/ReadMessagesByRowKeysInput";

import { useReadMessageMetadata } from "@/composables/message/message/useReadMessageMetadata";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(useReadMessageMetadata, () => {
  const { trpcMsw } = setupMswTrpc();
  let readMessageMetadata: ReturnType<typeof useReadMessageMetadata>;
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  test("reads only the replies a message names", async () => {
    expect.hasAssertions();

    const reply = createOptimisticMessage({ roomId, type: MessageType.Message }, userId);
    const replyingMessage = createOptimisticMessage({ replyToId: reply.id, roomId, type: MessageType.Message }, userId);
    const message = createOptimisticMessage({ roomId, type: MessageType.Message }, userId);
    const readMessagesByRowKeysInputs: ReadMessagesByRowKeysInput[] = [];
    trpcMsw.message.readMessagesByRowKeys.query(({ input }) => {
      readMessagesByRowKeysInputs.push(input);
      return [reply];
    });
    trpcMsw.room.readUsersByIds.query(() => []);
    trpcMsw.message.emoji.readEmojis.query(() => []);
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          readMessageMetadata = useReadMessageMetadata();
        },
      }),
    );
    await readMessageMetadata(roomId, [replyingMessage, message]);

    expect(readMessagesByRowKeysInputs).toStrictEqual([{ messageIds: [reply.id], roomId }]);
  });
});
