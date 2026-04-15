import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { RoomRole } from "@esposter/db-schema";

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
  const readRoles = async (input: ReadRolesInput) => {
    const roles = await $trpc.role.readRoles.query(input);
    rolesMap.value.set(input.roomId, roles);
    selectedRoleId.value = roles[0]?.id ?? null;
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
  return { createRole, deleteRole, getRoles, readRoles, selectedRole, selectedRoleId, selectRole, updateRole };
});
