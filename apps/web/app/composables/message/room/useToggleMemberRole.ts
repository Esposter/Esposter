import type { PublicUser, RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";

// One membership toggle, shared by every surface that offers one — the settings member editor and the profile
// Card's own menu. The actor's own standing is read here rather than threaded down as props, so a caller cannot
// Hand it a hierarchy it read at a different moment than the toggle it is guarding
export const useToggleMemberRole = (
  roomId: MaybeRefOrGetter<RoomInMessage["id"]>,
  userId: MaybeRefOrGetter<PublicUser["id"]>,
  role: MaybeRefOrGetter<RoomRoleInMessage>,
) => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { assignRole, getMemberRoles, getMyPermissions, revokeRole } = roleStore;
  const hasRole = computed(() =>
    getMemberRoles(toValue(roomId), toValue(userId)).some(({ id }) => id === toValue(role).id),
  );
  // The server judges a toggle against the member as well as the role, owner immunity included, so the switch is held
  // For both: a member whose top role is at or above the actor's is not one the actor can change
  const isManageable = computed(() => {
    const roomIdValue = toValue(roomId);
    const userIdValue = toValue(userId);
    const myPermissions = getMyPermissions(roomIdValue);
    if (!myPermissions) return false;

    const topPosition = Math.max(-1, ...getMemberRoles(roomIdValue, userIdValue).map(({ position }) => position));
    const isOwner = rooms.value.find(({ id }) => id === roomIdValue)?.userId === userIdValue;
    return (
      checkIsManageable(myPermissions.topRolePosition, toValue(role).position, myPermissions.isRoomOwner) &&
      checkIsMemberManageable(
        { isOwner: myPermissions.isRoomOwner, topPosition: myPermissions.topRolePosition },
        { isOwner, topPosition },
      )
    );
  });
  const toggleRole = () => {
    if (!isManageable.value) return;

    const input = { roleId: toValue(role).id, roomId: toValue(roomId), userId: toValue(userId) };
    if (hasRole.value) revokeRole(input);
    else assignRole(input);
  };
  return { hasRole, isManageable, toggleRole };
};
