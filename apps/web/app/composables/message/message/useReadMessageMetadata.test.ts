// @vitest-environment nuxt
import type { ReadMessagesByRowKeysInput } from "#shared/models/db/message/ReadMessagesByRowKeysInput";

import { useReadMessageMetadata } from "@/composables/message/message/useReadMessageMetadata";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(useReadMessageMetadata, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  test("reads only the replies a message names", async () => {
    expect.hasAssertions();

    const reply = createMessageEntity({ roomId, type: MessageType.Message, userId });
    const replyingMessage = createMessageEntity({
      replyRowKey: reply.rowKey,
      roomId,
      type: MessageType.Message,
      userId,
    });
    const message = createMessageEntity({ replyRowKey: "", roomId, type: MessageType.Message, userId });
    const readMessagesByRowKeysInputs: ReadMessagesByRowKeysInput[] = [];
    trpcMsw.message.readMessagesByRowKeys.query(({ input }) => {
      readMessagesByRowKeysInputs.push(input);
      return [reply];
    });
    trpcMsw.room.readMembersByIds.query(() => []);
    trpcMsw.message.emoji.readEmojis.query(() => []);
    let readMessageMetadata: ReturnType<typeof useReadMessageMetadata>;
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          readMessageMetadata = useReadMessageMetadata();
        },
      }),
    );
    await readMessageMetadata(roomId, [replyingMessage, message]);

    expect(readMessagesByRowKeysInputs).toStrictEqual([{ roomId, rowKeys: [reply.rowKey] }]);
  });
});
