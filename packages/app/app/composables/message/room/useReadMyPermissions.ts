import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

export const useReadMyPermissions = () => {
  const roleStore = useRoleStore();
  const { readMyPermissions } = roleStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;
    await readMyPermissions({ roomIds });
  };
};
