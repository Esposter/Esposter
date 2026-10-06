import type { MessageEntity } from "@esposter/db-schema";

import { useThreadStore } from "@/store/message/thread";

export const useOpenThread = () => {
  const { $trpc } = useNuxtApp();
  const threadStore = useThreadStore();
  const { openThread } = threadStore;
  const readMessageMetadata = useReadMessageMetadata();
  return (roomId: string, threadRootRowKey: MessageEntity["rowKey"]) =>
    openThread(roomId, threadRootRowKey, async () => {
      const messages = await $trpc.message.readThread.query({ roomId, threadRootRowKey });
      // What a reply renders besides itself — its attachments, the message it quotes, its reactions — is read the
      // Way a room's page reads it, and before the replies land so none of them renders without it
      await readMessageMetadata(roomId, messages);
      return messages;
    });
};
