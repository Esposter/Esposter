import type { MessageEntity } from "@esposter/db";
import type { VMenu } from "vuetify/components/VMenu";

export const useMessageStore = defineStore("message", () => {
  const optionsMenu = ref<{
    rowKey: MessageEntity["rowKey"];
    target: InstanceType<typeof VMenu>["$props"]["target"];
  }>();
  const { copied, copy, text } = useClipboard();
  return { copied, copy, optionsMenu, text };
});
