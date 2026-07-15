import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { ReadMemberRolesInput } from "#shared/models/db/role/ReadMemberRolesInput";
import type { ReadMyPermissionsInput } from "#shared/models/db/role/ReadMyPermissionsInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { checkIsManageable as checkIsManageableByPosition } from "#shared/services/room/rbac/checkIsManageable";
import { MANAGEMENT_PERMISSIONS } from "#shared/services/room/rbac/constants";
import { useMutation } from "@/composables/shared/useMutation";
import { useRoomStore } from "@/store/message/room";

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    data: roles,
    getData: baseGetRoles,
    setData: setRoles,
  } = useDataMap<RoomRoleInMessage[]>(() => roomStore.currentRoomId, []);
  const getRoles = (roomId: string) => baseGetRoles(roomId) ?? [];
  const {
    data: selectedRoleId,
    getData: getSelectedRoleId,
    setData: setSelectedRoleId,
  } = useDataMap(() => roomStore.currentRoomId, "");
  const selectedRole = computed(() => roles.value.find(({ id }) => id === selectedRoleId.value));
  const selectRole = (id: string) => {
    selectedRoleId.value = id;
  };
  const {
    data: myPermissions,
    getData: getMyPermissions,
    setData: setMyPermissions,
  } = useDataMap(() => roomStore.currentRoomId, {
    isRoomOwner: false,
    permissions: 0n,
    topRolePosition: -1,
  });
  const { data: selectedMemberId } = useDataMap(() => roomStore.currentRoomId, "");
  const selectMember = (id: string) => {
    selectedMemberId.value = id;
  };
  const checkIsManageable = (roomId: string) => {
    const myPermissions = getMyPermissions(roomId);
    if (!myPermissions) return false;
    return (
      checkIsManageableByPosition(myPermissions.topRolePosition, 0, myPermissions.isRoomOwner) ||
      Boolean(myPermissions.permissions & MANAGEMENT_PERMISSIONS)
    );
  };
  const {
    data: memberRoleMap,
    getData: getMemberRoleMap,
    setData: setMemberRoleMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, RoomRoleInMessage[]>());
  const getMemberRoles = (roomId: string, userId: string) => getMemberRoleMap(roomId)?.get(userId) ?? [];
  const setMemberRoles = (roomId: string, userId: string, roles: RoomRoleInMessage[]) => {
    const memberRoleMap = getMemberRoleMap(roomId) ?? new Map<string, RoomRoleInMessage[]>();
    memberRoleMap.set(userId, roles);
    setMemberRoleMap(roomId, memberRoleMap);
  };

  const readRoles = async (input: ReadRolesInput) => {
    const roles = await $trpc.role.readRoles.query(input);
    const rolesByRoomId = new Map<string, RoomRoleInMessage[]>();
    for (const role of roles) {
      const roomRoles = rolesByRoomId.get(role.roomId) ?? [];
      roomRoles.push(role);
      rolesByRoomId.set(role.roomId, roomRoles);
    }
    for (const roomId of input.roomIds) {
      const roomRoles = rolesByRoomId.get(roomId) ?? [];
      setRoles(roomId, roomRoles);

      const currentSelectedId = getSelectedRoleId(roomId);
      if (currentSelectedId && roomRoles.some(({ id }) => id === currentSelectedId)) continue;
      const everyoneRole = roomRoles.find(({ isEveryone }) => isEveryone);
      setSelectedRoleId(roomId, (everyoneRole ?? roomRoles[0])?.id ?? "");
    }
  };
  const readMyPermissions = async (input: ReadMyPermissionsInput) => {
    const data = await $trpc.role.readMyPermissions.query(input);
    for (const { roomId, ...rest } of data) setMyPermissions(roomId, rest);
  };
  const readMemberRoles = async (input: ReadMemberRolesInput) => {
    const memberRoles = await $trpc.role.readMemberRoles.query(input);
    const rolesByUserId = new Map<string, RoomRoleInMessage[]>();
    for (const { role, userId } of memberRoles) {
      const roles = rolesByUserId.get(userId) ?? [];
      roles.push(role);
      rolesByUserId.set(userId, roles);
    }
    for (const userId of input.userIds) setMemberRoles(input.roomId, userId, rolesByUserId.get(userId) ?? []);
  };
  const executeCreateRoleMutation = useMutation();
  const executeUpdateRoleMutation = useMutation();
  const executeDeleteRoleMutation = useMutation();
  const executeAssignRoleMutation = useMutation();
  const executeRevokeRoleMutation = useMutation();
  const createRole = async (input: CreateRoleInput) => {
    // Server-generated role — non-optimistic, applied in onSuccess
    await executeCreateRoleMutation(() => $trpc.role.createRole.mutate(input), {
      onSuccess: (newRole) => {
        setRoles(input.roomId, [newRole, ...getRoles(input.roomId)]);
        setSelectedRoleId(input.roomId, newRole.id);
      },
    });
  };
  const updateRole = async (input: UpdateRoleInput) => {
    const previousRoles = getRoles(input.roomId);
    await executeUpdateRoleMutation(() => $trpc.role.updateRole.mutate(input), {
      applyOptimistic: () => {
        setRoles(
          input.roomId,
          previousRoles.map((role) => (role.id === input.id ? { ...role, ...input } : role)),
        );
        return () => {
          setRoles(input.roomId, previousRoles);
        };
      },
      onSuccess: (updatedRole) => {
        setRoles(
          input.roomId,
          getRoles(input.roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
        );
      },
    });
  };
  const deleteRole = async (input: DeleteRoleInput) => {
    const previousRoles = getRoles(input.roomId);
    await executeDeleteRoleMutation(() => $trpc.role.deleteRole.mutate(input), {
      applyOptimistic: () => {
        setRoles(
          input.roomId,
          previousRoles.filter((role) => role.id !== input.id),
        );
        return () => {
          setRoles(input.roomId, previousRoles);
        };
      },
    });
  };
  const assignRole = async (input: AssignRoleInput) => {
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    if (existingMemberRoles.some(({ id }) => id === input.roleId)) return;
    const role = getRoles(input.roomId).find(({ id }) => id === input.roleId);
    await executeAssignRoleMutation(
      () => $trpc.role.assignRole.mutate(input),
      role
        ? {
            applyOptimistic: () => {
              setMemberRoles(input.roomId, input.userId, [...existingMemberRoles, role]);
              return () => {
                setMemberRoles(input.roomId, input.userId, existingMemberRoles);
              };
            },
          }
        : {
            onSuccess: (newRole) => {
              setMemberRoles(input.roomId, input.userId, [...existingMemberRoles, newRole]);
            },
          },
    );
  };
  const revokeRole = async (input: RevokeRoleInput) => {
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    await executeRevokeRoleMutation(() => $trpc.role.revokeRole.mutate(input), {
      applyOptimistic: () => {
        setMemberRoles(
          input.roomId,
          input.userId,
          existingMemberRoles.filter(({ id }) => id !== input.roleId),
        );
        return () => {
          setMemberRoles(input.roomId, input.userId, existingMemberRoles);
        };
      },
    });
  };
  return {
    assignRole,
    checkIsManageable,
    createRole,
    deleteRole,
    getMemberRoleMap,
    getMemberRoles,
    getMyPermissions,
    getRoles,
    memberRoleMap,
    myPermissions,
    readMemberRoles,
    readMyPermissions,
    readRoles,
    revokeRole,
    roles,
    selectedMemberId,
    selectedRole,
    selectedRoleId,
    selectMember,
    selectRole,
    setMemberRoles,
    setRoles,
    updateRole,
  };
});
