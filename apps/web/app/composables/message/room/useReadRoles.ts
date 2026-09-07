import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

export const useReadRoles = () => {
  const roleStore = useRoleStore();
  const { readRoles } = roleStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;
    await readRoles({ roomIds });
  };
};
