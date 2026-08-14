import type { MessageEntity } from "@esposter/db-schema";

import { useClipboardStore } from "@/store/clipboard";
import { RoutePath } from "@esposter/shared";

// A message link and a thread link are the same deep link — the thread is named by its root message — so the
// Message menu and the thread pane's menu copy through one function rather than each building the url
export const useCopyMessageLink = () => {
  const clipboardStore = useClipboardStore();
  const { copy } = clipboardStore;
  const runtimeConfig = useRuntimeConfig();
  return async (roomId: MessageEntity["partitionKey"], rowKey: MessageEntity["rowKey"]) => {
    await copy(`${runtimeConfig.public.baseUrl}${RoutePath.MessagesMessage(roomId, rowKey)}`);
  };
};
