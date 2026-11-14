import type { ClientMessage } from "@/models/message/ClientMessage";
import { useThreadStore } from "@/store/message/thread";

export const useOpenThread = () => {
  const { $trpc } = useNuxtApp();
  const threadStore = useThreadStore();
  const { openThread } = threadStore;
  const readMessageMetadata = useReadMessageMetadata();
  return (roomId: string, threadRootId: ClientMessage["id"]) =>
    openThread(roomId, threadRootId, async () => {
      const messages = await $trpc.message.readThread.query({ roomId, threadRootId });
      // What a reply renders besides itself — its attachments, the message it quotes, its reactions — is read the
      // Way a room's page reads it, and before the replies land so none of them renders without it
      await readMessageMetadata(roomId, messages);
      return messages;
    });
};
