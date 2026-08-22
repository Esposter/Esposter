import type { RoomInMessage, RoomRoleInMessage, User } from "@esposter/db-schema";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { useRoleStore } from "@/store/message/room/role";

// One membership toggle, shared by every surface that offers one — the settings member editor and the profile
// Card's own menu. The actor's own standing is read here rather than threaded down as props, so a caller cannot
// Hand it a hierarchy it read at a different moment than the toggle it is guarding
export const useToggleMemberRole = (
  roomId: MaybeRefOrGetter<RoomInMessage["id"]>,
  userId: MaybeRefOrGetter<User["id"]>,
  role: MaybeRefOrGetter<RoomRoleInMessage>,
) => {
  const roleStore = useRoleStore();
  const { assignRole, getMemberRoles, getMyPermissions, revokeRole } = roleStore;
  const hasRole = computed(() =>
    getMemberRoles(toValue(roomId), toValue(userId)).some(({ id }) => id === toValue(role).id),
  );
  const isManageable = computed(() => {
    const myPermissions = getMyPermissions(toValue(roomId));
    if (!myPermissions) return false;
    return checkIsManageable(myPermissions.topRolePosition, toValue(role).position, myPermissions.isRoomOwner);
  });
  const toggleRole = async () => {
    const input = { roleId: toValue(role).id, roomId: toValue(roomId), userId: toValue(userId) };
    if (hasRole.value) await revokeRole(input);
    else await assignRole(input);
  };
  return { hasRole, isManageable, toggleRole };
};
