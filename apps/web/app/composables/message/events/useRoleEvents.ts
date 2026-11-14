import { authClient } from "@/services/auth/authClient";
import { useRoleStore } from "@/store/message/room/role";
import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

// A role's permission bitfield is a bigint, which JSON cannot carry, so an event names it by its decimal digits
const parseRole = <TRole extends { permissions: string }>({ permissions, ...role }: TRole) => ({
  ...role,
  permissions: BigInt(permissions),
});

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
      const parsedRole = parseRole(role);
      const existingMemberRoles = getMemberRoles(parsedRole.roomId, userId);
      if (!existingMemberRoles.some(({ id }) => id === parsedRole.id))
        mutateMemberRoles(parsedRole.roomId, userId, [...existingMemberRoles, parsedRole]);
    }),
  );
  onScopeDispose(
    onRoomEvent("createRole", (newRole) => {
      const parsedRole = parseRole(newRole);
      setRoles(parsedRole.roomId, [parsedRole, ...getRoles(parsedRole.roomId)]);
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
      setMemberPermissionOverride(eventRoomId, userId, { allow: BigInt(allow), deny: BigInt(deny) });
      // A member's own bitfield is what every permission gate reads, so their change re-reads it rather than
      // Recomputing it here from the roles the client may not hold in full
      if (userId === session.value.data?.user.id) readMyPermissionsInBackground(eventRoomId);
    }),
  );
  onScopeDispose(
    onRoomEvent("updateRole", (updatedRole) => {
      const parsedRole = parseRole(updatedRole);
      setRoles(
        parsedRole.roomId,
        getRoles(parsedRole.roomId).map((role) => (role.id === parsedRole.id ? parsedRole : role)),
      );
    }),
  );
};
