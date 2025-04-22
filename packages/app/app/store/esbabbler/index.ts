import type { User } from "#shared/db/schema/users";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEsbabblerStore = defineStore("esbabbler", () => {
  const roomStore = useRoomStore();
  const { data: userMap, dataMap: userDataMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, User>());
  return { userMap };
});
