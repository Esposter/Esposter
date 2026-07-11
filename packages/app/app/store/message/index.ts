import type { MessageEntity } from "@esposter/db-schema";
import type { VMenu } from "vuetify/components/VMenu";

import { skipHydrate } from "pinia";

export const useMessageStore = defineStore("message", () => {
  const optionsMenu = ref<{
    rowKey: MessageEntity["rowKey"];
    target: InstanceType<typeof VMenu>["$props"]["target"];
  }>();
  const editingRowKey = ref<MessageEntity["rowKey"]>();
  const { copied, copy, text } = useClipboard();
  // copied/text are readonly refs, so they cannot be written to by pinia's SSR payload hydration
  return { copied: skipHydrate(copied), copy, editingRowKey, optionsMenu, text: skipHydrate(text) };
});
