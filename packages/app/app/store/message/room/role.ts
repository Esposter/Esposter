import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { GetMemberRolesInput } from "#shared/models/db/role/GetMemberRolesInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { RoomRole } from "@esposter/db-schema";
import { MANAGEMENT_PERMISSIONS } from "#shared/services/room/rbac/constants";
import { isManageable as isManageableByPosition } from "#shared/services/room/rbac/isManageable";

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
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
  const memberRolesMap = ref(new Map<string, RoomRole[]>());
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
  const getMemberRoles = (userId: string) => memberRolesMap.value.get(userId) ?? [];

  const readRoles = async (input: ReadRolesInput) => {
    const roles = await $trpc.role.readRoles.query(input);
    rolesMap.value.set(input.roomId, roles);
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    selectedRoleId.value = (everyoneRole ?? roles[0])?.id ?? null;
  };
  const readMyPermissions = async (input: ReadRolesInput) => {
    const data = await $trpc.role.getMyPermissions.query(input);
    myPermissionsMap.value.set(input.roomId, data);
  };
  const readMemberRoles = async (input: GetMemberRolesInput) => {
    const roles = await $trpc.role.getMemberRoles.query(input);
    memberRolesMap.value.set(input.userId, roles);
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
    await $trpc.role.assignRole.mutate(input);
    const role = getRoles(input.roomId).find(({ id }) => id === input.roleId);
    if (role) {
      const existing = getMemberRoles(input.userId);
      if (!existing.some(({ id }) => id === input.roleId)) memberRolesMap.value.set(input.userId, [...existing, role]);
    }
  };
  const revokeRole = async (input: RevokeRoleInput) => {
    await $trpc.role.revokeRole.mutate(input);
    const existing = getMemberRoles(input.userId);
    memberRolesMap.value.set(
      input.userId,
      existing.filter(({ id }) => id !== input.roleId),
    );
  };
  return {
    assignRole,
    createRole,
    deleteRole,
    getMemberRoles,
    getRoles,
    isManageable,
    memberRolesMap,
    myPermissionsMap,
    readMemberRoles,
    readMyPermissions,
    readRoles,
    revokeRole,
    selectedMemberId,
    selectedRole,
    selectedRoleId,
    selectMember,
    selectRole,
    updateRole,
  };
});
