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
import { getTopRole } from "@/services/message/member/getTopRole";
import { topRoleChangeHooks } from "@/services/message/member/topRoleChangeHooks";
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
    const roomPermissions = getMyPermissions(roomId);
    if (!roomPermissions) return false;
    return (
      checkIsManageableByPosition(roomPermissions.topRolePosition, 0, roomPermissions.isRoomOwner) ||
      Boolean(roomPermissions.permissions & MANAGEMENT_PERMISSIONS)
    );
  };
  const {
    data: memberRoleMap,
    getData: getMemberRoleMap,
    setData: setMemberRoleMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, RoomRoleInMessage[]>());
  const getMemberRoles = (roomId: string, userId: string) => getMemberRoleMap(roomId)?.get(userId) ?? [];
  const setMemberRoles = (roomId: string, userId: string, memberRoles: RoomRoleInMessage[]) => {
    const roomMemberRoleMap = getMemberRoleMap(roomId) ?? new Map<string, RoomRoleInMessage[]>();
    roomMemberRoleMap.set(userId, memberRoles);
    setMemberRoleMap(roomId, roomMemberRoleMap);
  };
  // Every role-membership MUTATION funnels through here (reads use setMemberRoles directly — the server
  // Counts already include them) so top-role-derived state stays current via the registered hooks
  const mutateMemberRoles = (roomId: string, userId: string, newRoles: RoomRoleInMessage[]) => {
    const previousTopRoleId = getTopRole(getMemberRoles(roomId, userId))?.id ?? "";
    const newTopRoleId = getTopRole(newRoles)?.id ?? "";
    setMemberRoles(roomId, userId, newRoles);
    if (previousTopRoleId === newTopRoleId) return;
    for (const topRoleChangeHook of topRoleChangeHooks.hooks)
      topRoleChangeHook(roomId, previousTopRoleId, newTopRoleId);
  };

  const readRoles = async (input: ReadRolesInput) => {
    const fetchedRoles = await $trpc.role.readRoles.query(input);
    const rolesByRoomId = new Map<string, RoomRoleInMessage[]>();
    for (const role of fetchedRoles) {
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
      const userRoles = rolesByUserId.get(userId) ?? [];
      userRoles.push(role);
      rolesByUserId.set(userId, userRoles);
    }
    for (const userId of input.userIds) setMemberRoles(input.roomId, userId, rolesByUserId.get(userId) ?? []);
  };
  const { executeMutation: executeCreateRoleMutation } = useMutation();
  const { executeMutation: executeUpdateRoleMutation } = useMutation();
  const { executeMutation: executeDeleteRoleMutation } = useMutation();
  const { executeMutation: executeAssignRoleMutation } = useMutation();
  const { executeMutation: executeRevokeRoleMutation } = useMutation();
  const createRole = async (input: CreateRoleInput) => {
    // Server-generated role — non-optimistic, applied in onSuccess. Creates have no natural entity key,
    // So each call gets a unique one — overlapping creates must never stale-drop each other's onSuccess
    await executeCreateRoleMutation(() => $trpc.role.createRole.mutate(input), {
      key: Symbol(),
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
      // Keyed per role so concurrent operations on different roles never stale-drop each other
      key: input.id,
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
    let isSuccessful = false;
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
      // Keyed per role so concurrent operations on different roles never stale-drop each other
      key: input.id,
      onSuccess: () => {
        isSuccessful = true;
      },
    });
    return isSuccessful;
  };
  const assignRole = async (input: AssignRoleInput) => {
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    if (existingMemberRoles.some(({ id }) => id === input.roleId)) return;
    const role = getRoles(input.roomId).find(({ id }) => id === input.roleId);
    // Keyed per member-role pair so concurrent assignments across members/roles never stale-drop each other
    const key = `${input.userId}-${input.roleId}`;
    await executeAssignRoleMutation(
      () => $trpc.role.assignRole.mutate(input),
      role
        ? {
            applyOptimistic: () => {
              mutateMemberRoles(input.roomId, input.userId, [...existingMemberRoles, role]);
              return () => {
                mutateMemberRoles(input.roomId, input.userId, existingMemberRoles);
              };
            },
            key,
          }
        : {
            key,
            onSuccess: (newRole) => {
              mutateMemberRoles(input.roomId, input.userId, [...existingMemberRoles, newRole]);
            },
          },
    );
  };
  const revokeRole = async (input: RevokeRoleInput) => {
    const existingMemberRoles = getMemberRoles(input.roomId, input.userId);
    await executeRevokeRoleMutation(() => $trpc.role.revokeRole.mutate(input), {
      applyOptimistic: () => {
        mutateMemberRoles(
          input.roomId,
          input.userId,
          existingMemberRoles.filter(({ id }) => id !== input.roleId),
        );
        return () => {
          mutateMemberRoles(input.roomId, input.userId, existingMemberRoles);
        };
      },
      // Keyed per member-role pair so concurrent revocations across members/roles never stale-drop each other
      key: `${input.userId}-${input.roleId}`,
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
    mutateMemberRoles,
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
