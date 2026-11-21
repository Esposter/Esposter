import type { ReadMemberRolesInput } from "#shared/models/db/role/ReadMemberRolesInput";
import type { UserToRoomRoleInMessageWithRelations } from "@esposter/db-schema";

import { userToRoomRoleTable } from "#src/services/message/role/constants";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { useRoleStore } from "#src/store/message/room/role";

// The roles of members, read for one surface: the instance is the surface's, so each read's watch is released with the
// Surface that made it. A profile card, a member list page and a settings editor each read the members they show, and a
// Store-level instance would keep every one of those watches for the store's whole life
export const useReadMemberRoles = () => {
  const { $trpc } = useNuxtApp();
  const roleStore = useRoleStore();
  const { arriveRoomRoles, markMemberRolesRead } = roleStore;
  const readMemberRoleRows = useOverlayRead(
    userToRoomRoleTable,
    ({ role, ...memberRole }: UserToRoomRoleInMessageWithRelations) => {
      arriveRoomRoles([role]);
      return memberRole;
    },
  );
  return ({ roomId, userIds }: ReadMemberRolesInput) =>
    rethrowFailedRead(
      readMemberRoleRows(() => $trpc.role.readMemberRoles.query({ roomId, userIds }), {
        // A fresh target per read, so a later page of members does not supersede the watch of an earlier one
        key: Symbol("readMemberRoles"),
        onError: console.error,
        onSuccess: () => {
          markMemberRolesRead(roomId, userIds);
        },
      }),
    );
};
