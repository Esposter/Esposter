import type { User } from "#shared/db/schema/users";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEsbabblerStore = defineStore("esbabbler", () => {
  const roomStore = useRoomStore();
  const {
    data: userMap,
    getDataMap: getUserDataMap,
    setDataMap: setUserDataMap,
  } = createDataMap(() => roomStore.currentRoomId, new Map<string, User>());
  return { getUserDataMap, setUserDataMap, userMap };
});
