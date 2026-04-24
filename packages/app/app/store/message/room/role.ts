import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { ReadMemberRolesInput } from "#shared/models/db/role/ReadMemberRolesInput";
import type { ReadMyPermissionsInput } from "#shared/models/db/role/ReadMyPermissionsInput";
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
  const {
    data: roles,
    getData: baseGetRoles,
    setData: setRoles,
  } = useDataMap<RoomRole[]>(() => roomStore.currentRoomId, []);
  const getRoles = (roomId: string) => baseGetRoles(roomId) ?? [];
  const { data: selectedRoleId, setData: setSelectedRoleId } = useDataMap<null | string>(
    () => roomStore.currentRoomId,
    null,
  );
  const selectedRole = computed(() => {
    if (!selectedRoleId.value) return null;
    return roles.value.find(({ id }) => id === selectedRoleId.value) ?? null;
  });
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
  const { data: selectedMemberId } = useDataMap<null | string>(() => roomStore.currentRoomId, null);
  const selectMember = (id: string) => {
    selectedMemberId.value = id;
  };
  const isManageable = (roomId: string) => {
    const myPermissions = getMyPermissions(roomId);
    if (!myPermissions) return false;
    return (
      isManageableByPosition(myPermissions.topRolePosition, 0, myPermissions.isRoomOwner) ||
      Boolean(myPermissions.permissions & MANAGEMENT_PERMISSIONS)
    );
  };
  const {
    data: memberRoleMap,
    getData: getMemberRoleMap,
    setData: setMemberRoleMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, RoomRole[]>());
  const getMemberRoles = (roomId: string, userId: string) => getMemberRoleMap(roomId)?.get(userId) ?? [];
  const setMemberRoles = (roomId: string, userId: string, roles: RoomRole[]) => {
    const memberRoleMap = getMemberRoleMap(roomId) ?? new Map<string, RoomRole[]>();
    memberRoleMap.set(userId, roles);
    setMemberRoleMap(roomId, memberRoleMap);
  };

  const readRoles = async (input: ReadRolesInput) => {
    const roles = await $trpc.role.readRoles.query(input);
    const rolesByRoomId = new Map<string, RoomRole[]>();
    for (const role of roles) {
      const roomRoles = rolesByRoomId.get(role.roomId) ?? [];
      roomRoles.push(role);
      rolesByRoomId.set(role.roomId, roomRoles);
    }
    for (const roomId of input.roomIds) {
      const roomRoles = rolesByRoomId.get(roomId) ?? [];
      setRoles(roomId, roomRoles);

      const everyoneRole = roomRoles.find(({ isEveryone }) => isEveryone);
      setSelectedRoleId(roomId, (everyoneRole ?? roomRoles[0])?.id ?? null);
    }
  };
  const readMyPermissions = async (input: ReadMyPermissionsInput) => {
    const data = await $trpc.role.readMyPermissions.query(input);
    for (const { roomId, ...rest } of data) setMyPermissions(roomId, rest);
  };
  const readMemberRoles = async (input: ReadMemberRolesInput) => {
    const memberRoles = await $trpc.role.readMemberRoles.query(input);
    const rolesByUserId = new Map<string, RoomRole[]>();
    for (const { role, userId } of memberRoles) {
      const roles = rolesByUserId.get(userId) ?? [];
      roles.push(role);
      rolesByUserId.set(userId, roles);
    }
    for (const userId of input.userIds) setMemberRoles(input.roomId, userId, rolesByUserId.get(userId) ?? []);
  };
  const createRole = async (input: CreateRoleInput) => {
    const newRole = await $trpc.role.createRole.mutate(input);
    setRoles(input.roomId, [newRole, ...getRoles(input.roomId)]);
    setSelectedRoleId(input.roomId, newRole.id);
    return newRole;
  };
  const updateRole = async (input: UpdateRoleInput) => {
    const updatedRole = await $trpc.role.updateRole.mutate(input);
    setRoles(
      input.roomId,
      getRoles(input.roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );
  };
  const deleteRole = async (input: DeleteRoleInput) => {
    const { id } = await $trpc.role.deleteRole.mutate(input);
    setRoles(
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
    getMemberRoleMap,
    getMemberRoles,
    getMyPermissions,
    getRoles,
    isManageable,
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
