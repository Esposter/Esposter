import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { VMenu } from "vuetify/components/VMenu";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEsbabblerStore = defineStore("esbabbler", () => {
  const roomStore = useRoomStore();
  const {
    data: userMap,
    getDataMap: getUserDataMap,
    setDataMap: setUserDataMap,
  } = createDataMap(() => roomStore.currentRoomId, new Map<string, User>());
  const optionsMenu = ref<{
    rowKey: MessageEntity["rowKey"];
    target: InstanceType<typeof VMenu>["$props"]["target"];
  }>();
  const { copied, copy, text } = useClipboard();
  return { copied, copy, getUserDataMap, optionsMenu, setUserDataMap, text, userMap };
});
