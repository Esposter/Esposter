import { authClient } from "@/services/auth/authClient";
import { useRoleStore } from "@/store/message/room/role";
import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useRoleEvents = () => {
  const roleStore = useRoleStore();
  const {
    getMemberRoleMap,
    getMemberRoles,
    getRoles,
    mutateMemberRoles,
    readMyPermissions,
    setMemberPermissionOverride,
    setRoles,
  } = roleStore;
  const session = authClient.useSession();
  const readMyPermissionsInBackground = getSynchronizedFunction((roomId: string) =>
    getResultAsync(() => readMyPermissions({ roomIds: [roomId] })).match(noop, console.error),
  );
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  onScopeDispose(
    onRoomEvent("assignRole", ({ userId, ...role }) => {
      const existingMemberRoles = getMemberRoles(role.roomId, userId);
      if (!existingMemberRoles.some(({ id }) => id === role.id))
        mutateMemberRoles(role.roomId, userId, [...existingMemberRoles, role]);
    }),
  );
  onScopeDispose(
    onRoomEvent("createRole", (newRole) => {
      setRoles(newRole.roomId, [newRole, ...getRoles(newRole.roomId)]);
    }),
  );
  onScopeDispose(
    onRoomEvent("deleteRole", ({ id, roomId: eventRoomId }) => {
      setRoles(
        eventRoomId,
        getRoles(eventRoomId).filter((role) => role.id !== id),
      );
      const memberRoleMap = getMemberRoleMap(eventRoomId);
      if (!memberRoleMap) return;
      for (const [userId, roles] of memberRoleMap)
        mutateMemberRoles(
          eventRoomId,
          userId,
          roles.filter((role) => role.id !== id),
        );
    }),
  );
  onScopeDispose(
    onRoomEvent("revokeRole", ({ roleId, roomId: eventRoomId, userId }) => {
      mutateMemberRoles(
        eventRoomId,
        userId,
        getMemberRoles(eventRoomId, userId).filter(({ id }) => id !== roleId),
      );
    }),
  );
  onScopeDispose(
    onRoomEvent("updateMemberPermissionOverride", ({ allow, deny, roomId: eventRoomId, userId }) => {
      setMemberPermissionOverride(eventRoomId, userId, { allow, deny });
      // A member's own bitfield is what every permission gate reads, so their change re-reads it rather than
      // Recomputing it here from the roles the client may not hold in full
      if (userId === session.value.data?.user.id) readMyPermissionsInBackground(eventRoomId);
    }),
  );
  onScopeDispose(
    onRoomEvent("updateRole", (updatedRole) => {
      setRoles(
        updatedRole.roomId,
        getRoles(updatedRole.roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
      );
    }),
  );
};
