import type { MessageEntity } from "@esposter/db-schema";

import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useLayoutStore as useMessageLayoutStore } from "@/store/message/ui/layout";

export const useThreadStore = defineStore("message/thread", () => {
  const { $trpc } = useNuxtApp();
  const activeRootRowKey = ref<null | string>(null);
  const activeRoomId = ref<null | string>(null);
  const threadMessages = ref<MessageEntity[]>([]);
  const layoutStore = useLayoutStore();
  const messageLayoutStore = useMessageLayoutStore();

  const openThread = async (roomId: string, rootRowKey: string) => {
    activeRoomId.value = roomId;
    activeRootRowKey.value = rootRowKey;
    const messages = await $trpc.message.readThread.query({ roomId, rootRowKey });
    if (activeRoomId.value !== roomId || activeRootRowKey.value !== rootRowKey) return;
    threadMessages.value = messages;
    messageLayoutStore.rightDrawer = RightDrawer.Thread;
    layoutStore.isRightDrawerOpen = true;
  };
  const closeThread = () => {
    activeRootRowKey.value = null;
    activeRoomId.value = null;
    threadMessages.value = [];
    layoutStore.isRightDrawerOpen = false;
  };
  return {
    activeRoomId,
    activeRootRowKey,
    closeThread,
    openThread,
    threadMessages,
  };
});
