import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { Room, RoomRole } from "@esposter/db-schema";
import type { Except } from "type-fest";

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const rolesMap = ref(new Map<string, RoomRole[]>());

  const getRoles = (roomId: string) => rolesMap.value.get(roomId) ?? [];

  const readRoles = async (roomId: Room["id"]) => {
    const result = await $trpc.role.readRoles.query({ roomId });
    rolesMap.value = new Map(rolesMap.value).set(roomId, result);
  };

  const createRole = async (roomId: Room["id"], input: Except<CreateRoleInput, "roomId">) => {
    const newRole = await $trpc.role.createRole.mutate({ ...input, roomId });
    rolesMap.value = new Map(rolesMap.value).set(roomId, [newRole, ...getRoles(roomId)]);
  };

  const updateRole = async (roomId: Room["id"], input: Except<UpdateRoleInput, "roomId">) => {
    const updatedRole = await $trpc.role.updateRole.mutate({ ...input, roomId });
    rolesMap.value = new Map(rolesMap.value).set(
      roomId,
      getRoles(roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );
  };

  const deleteRole = async (roomId: Room["id"], input: Except<DeleteRoleInput, "roomId">) => {
    const { id } = await $trpc.role.deleteRole.mutate({ ...input, roomId });
    rolesMap.value = new Map(rolesMap.value).set(
      roomId,
      getRoles(roomId).filter((role) => role.id !== id),
    );
  };

  return { createRole, deleteRole, getRoles, readRoles, updateRole };
});
