import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { VMenu } from "vuetify/components/VMenu";

import { useRoomStore } from "@/store/message/room";

export const useMessageStore = defineStore("message", () => {
  const roomStore = useRoomStore();
  const {
    data: userMap,
    getDataMap: getUserDataMap,
    setDataMap: setUserDataMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, User>());
  const optionsMenu = ref<{
    rowKey: MessageEntity["rowKey"];
    target: InstanceType<typeof VMenu>["$props"]["target"];
  }>();
  const { copied, copy, text } = useClipboard();
  return { copied, copy, getUserDataMap, optionsMenu, setUserDataMap, text, userMap };
});
