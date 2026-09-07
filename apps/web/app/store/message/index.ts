import type { MessageEntity } from "@esposter/db-schema";
import type { VMenu } from "vuetify/components/VMenu";

export const useMessageStore = defineStore("message", () => {
  const optionsMenu = ref<{
    rowKey: MessageEntity["rowKey"];
    target: InstanceType<typeof VMenu>["$props"]["target"];
  }>();
  const editingRowKey = ref<MessageEntity["rowKey"]>();
  return {
    editingRowKey,
    optionsMenu,
  };
});
