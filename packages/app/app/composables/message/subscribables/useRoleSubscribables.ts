import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";

export const useRoleSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { getMemberRoleMap, getMemberRoles, getRoles, setMemberRoles } = roleStore;
  const { rolesMap } = storeToRefs(roleStore);

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    const assignRoleUnsubscribable = $trpc.role.onAssignRole.subscribe(
      { roomId },
      {
        onData: ({ userId, ...role }) => {
          const existingMemberRoles = getMemberRoles(role.roomId, userId);
          if (existingMemberRoles.some(({ id }) => id === role.id)) return;
          setMemberRoles(role.roomId, userId, [...existingMemberRoles, role]);
        },
      },
    );
    const createRoleUnsubscribable = $trpc.role.onCreateRole.subscribe(
      { roomId },
      {
        onData: (newRole) => {
          rolesMap.value.set(newRole.roomId, [newRole, ...getRoles(newRole.roomId)]);
        },
      },
    );
    const deleteRoleUnsubscribable = $trpc.role.onDeleteRole.subscribe(
      { roomId },
      {
        onData: ({ id, roomId }) => {
          rolesMap.value.set(
            roomId,
            getRoles(roomId).filter((role) => role.id !== id),
          );
          const memberRoleMap = getMemberRoleMap(roomId);
          if (!memberRoleMap) return;
          for (const [userId, roles] of memberRoleMap)
            setMemberRoles(
              roomId,
              userId,
              roles.filter((role) => role.id !== id),
            );
        },
      },
    );
    const revokeRoleUnsubscribable = $trpc.role.onRevokeRole.subscribe(
      { roomId },
      {
        onData: ({ roleId, roomId, userId }) => {
          setMemberRoles(
            roomId,
            userId,
            getMemberRoles(roomId, userId).filter(({ id }) => id !== roleId),
          );
        },
      },
    );
    const updateRoleUnsubscribable = $trpc.role.onUpdateRole.subscribe(
      { roomId },
      {
        onData: (updatedRole) => {
          rolesMap.value.set(
            updatedRole.roomId,
            getRoles(updatedRole.roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
          );
        },
      },
    );

    return () => {
      assignRoleUnsubscribable.unsubscribe();
      createRoleUnsubscribable.unsubscribe();
      deleteRoleUnsubscribable.unsubscribe();
      revokeRoleUnsubscribable.unsubscribe();
      updateRoleUnsubscribable.unsubscribe();
    };
  });
};
