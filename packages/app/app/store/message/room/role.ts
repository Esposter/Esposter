import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { ReadMemberRolesInput } from "#shared/models/db/role/ReadMemberRolesInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { RoomRole } from "@esposter/db-schema";

import { MANAGEMENT_PERMISSIONS } from "#shared/services/room/rbac/constants";
import { isManageable as isManageableByPosition } from "#shared/services/room/rbac/isManageable";
import { useRoomStore } from "@/store/message/room";

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const rolesMap = ref(new Map<string, RoomRole[]>());
  const getRoles = (roomId: string) => rolesMap.value.get(roomId) ?? [];
  const selectedRoleId = ref<null | string>(null);
  const selectedRole = computed(() => {
    if (!selectedRoleId.value) return null;
    for (const roles of rolesMap.value.values()) {
      const role = roles.find(({ id }) => id === selectedRoleId.value);
      if (role) return role;
    }
    return null;
  });
  const selectRole = (id: string) => {
    selectedRoleId.value = id;
  };
  const myPermissionsMap = ref(
    new Map<string, { isRoomOwner: boolean; permissions: bigint; topRolePosition: number }>(),
  );
  const selectedMemberId = ref<null | string>(null);
  const selectMember = (id: string) => {
    selectedMemberId.value = id;
  };
  const isManageable = (roomId: string) => {
    const data = myPermissionsMap.value.get(roomId);
    if (!data) return false;
    return (
      isManageableByPosition(data.topRolePosition, 0, data.isRoomOwner) ||
      Boolean(data.permissions & MANAGEMENT_PERMISSIONS)
    );
  };
  const {
    data: memberRoleMap,
    getDataMap: getMemberRoleMap,
    setDataMap: setMemberRoleMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, RoomRole[]>());
  const getMemberRoles = (roomId: string, userId: string) => getMemberRoleMap(roomId)?.get(userId) ?? [];
  const setMemberRoles = (roomId: string, userId: string, roles: RoomRole[]) => {
    const memberRoleMap = getMemberRoleMap(roomId) ?? new Map<string, RoomRole[]>();
    memberRoleMap.set(userId, roles);
    setMemberRoleMap(roomId, memberRoleMap);
  };

  const readRoles = async (input: ReadRolesInput) => {
    const roles = await $trpc.role.readRoles.query(input);
    rolesMap.value.set(input.roomId, roles);
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    selectedRoleId.value = (everyoneRole ?? roles[0])?.id ?? null;
  };
  const readMyPermissions = async (input: ReadRolesInput) => {
    const data = await $trpc.role.readMyPermissions.query(input);
    myPermissionsMap.value.set(input.roomId, data);
  };
  const readMemberRoles = async (input: ReadMemberRolesInput) => {
    const memberRoles = await $trpc.role.readMemberRoles.query(input);
    const rolesByUserId = new Map<string, RoomRole[]>();
    for (const { userId, ...role } of memberRoles) {
      const roles = rolesByUserId.get(userId) ?? [];
      roles.push(role);
      rolesByUserId.set(userId, roles);
    }
    for (const userId of input.userIds) setMemberRoles(input.roomId, userId, rolesByUserId.get(userId) ?? []);
  };
  const createRole = async (input: CreateRoleInput) => {
    const newRole = await $trpc.role.createRole.mutate(input);
    rolesMap.value.set(input.roomId, [newRole, ...getRoles(input.roomId)]);
    selectedRoleId.value = newRole.id;
    return newRole;
  };
  const updateRole = async (input: UpdateRoleInput) => {
    const updatedRole = await $trpc.role.updateRole.mutate(input);
    rolesMap.value.set(
      input.roomId,
      getRoles(input.roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );
  };
  const deleteRole = async (input: DeleteRoleInput) => {
    const { id } = await $trpc.role.deleteRole.mutate(input);
    rolesMap.value.set(
      input.roomId,
      getRoles(input.roomId).filter((role) => role.id !== id),
    );
  };
  const assignRole = async (input: AssignRoleInput) => {
    const role = await $trpc.role.assignRole.mutate(input);
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    if (existingMemberRoles.some(({ id }) => id === input.roleId)) return;
    setMemberRoles(input.roomId, input.userId, [...existingMemberRoles, role]);
  };
  const revokeRole = async (input: RevokeRoleInput) => {
    await $trpc.role.revokeRole.mutate(input);
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    setMemberRoles(
      input.roomId,
      input.userId,
      existingMemberRoles.filter(({ id }) => id !== input.roleId),
    );
  };
  return {
    assignRole,
    createRole,
    deleteRole,
    getMemberRoles,
    getRoles,
    isManageable,
    memberRoleMap,
    myPermissionsMap,
    readMemberRoles,
    readMyPermissions,
    readRoles,
    revokeRole,
    rolesMap,
    selectedMemberId,
    selectedRole,
    selectedRoleId,
    selectMember,
    selectRole,
    setMemberRoles,
    updateRole,
  };
});
