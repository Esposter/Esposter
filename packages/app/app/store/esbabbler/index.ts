import type { User } from "#shared/db/schema/users";
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
  const { data: optionsMenuMap } = createDataMap(
    () => roomStore.currentRoomId,
    new Map<string, InstanceType<typeof VMenu>["$props"]["target"]>(),
  );
  return { getUserDataMap, optionsMenuMap, setUserDataMap, userMap };
});
