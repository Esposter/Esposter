import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { ReadMemberRolesInput } from "#shared/models/db/role/ReadMemberRolesInput";
import type { ReadMyPermissionsInput } from "#shared/models/db/role/ReadMyPermissionsInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { RoomPermission, RoomRoleInMessage } from "@esposter/db-schema";

import { checkIsManageable as baseCheckIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { getTopRole } from "@/services/message/member/getTopRole";
import { topRoleChangeHooks } from "@/services/message/member/topRoleChangeHooks";
import { MANAGEMENT_PERMISSIONS } from "@/services/room/rbac/constants";
import { useRoomStore } from "@/store/message/room";
import { checkHasPermission } from "@esposter/db-schema";
import { ID_SEPARATOR, noop } from "@esposter/shared";

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    data: roles,
    getData: baseGetRoles,
    setData: setRoles,
  } = useDataMap<RoomRoleInMessage[]>(() => roomStore.scopedRoomId, []);
  const getRoles = (roomId: string) => baseGetRoles(roomId) ?? [];
  // Replaces one role where it stands, so a rollback or a server copy never disturbs what a concurrent write —
  // Or the role subscription — did to the rest of the list while this one was in flight
  const setRole = (roomId: string, updatedRole: RoomRoleInMessage) => {
    setRoles(
      roomId,
      getRoles(roomId).map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );
  };
  const {
    data: selectedRoleId,
    getData: getSelectedRoleId,
    setData: setSelectedRoleId,
  } = useDataMap(() => roomStore.scopedRoomId, "");
  const selectedRole = computed(() => roles.value.find(({ id }) => id === selectedRoleId.value));
  const selectRole = (id: string) => {
    selectedRoleId.value = id;
  };
  const {
    data: myPermissions,
    getData: getMyPermissions,
    setData: setMyPermissions,
  } = useDataMap(() => roomStore.scopedRoomId, {
    isRoomOwner: false,
    permissions: 0n,
    topRolePosition: -1,
  });
  const { data: selectedMemberId } = useDataMap(() => roomStore.scopedRoomId, "");
  const selectMember = (id: string) => {
    selectedMemberId.value = id;
  };
  // Owner bypass and the bitfield test are one question, and every surface that gates on a permission asks it
  // The same way — a caller reading `permissions` on its own silently drops the bypass
  const checkHasMyPermission = (roomId: string, permission: RoomPermission) => {
    const myRoomPermissions = getMyPermissions(roomId);
    if (!myRoomPermissions) return false;
    return checkHasPermission(myRoomPermissions.permissions, permission, myRoomPermissions.isRoomOwner);
  };
  const checkIsManageable = (roomId: string) => {
    const roomPermissions = getMyPermissions(roomId);
    if (!roomPermissions) return false;
    return (
      baseCheckIsManageable(roomPermissions.topRolePosition, 0, roomPermissions.isRoomOwner) ||
      Boolean(roomPermissions.permissions & MANAGEMENT_PERMISSIONS)
    );
  };
  const {
    data: memberRoleMap,
    getData: getMemberRoleMap,
    setData: setMemberRoleMap,
  } = useDataMap(() => roomStore.scopedRoomId, new Map<string, RoomRoleInMessage[]>());
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
  // Both sides of one membership, written against whatever the member's list holds right now rather than a
  // Copy read before the write went out — so an overlapping assign/revoke on another role survives this one
  const setMemberRole = (roomId: string, userId: string, newRole: RoomRoleInMessage) => {
    mutateMemberRoles(roomId, userId, [
      ...getMemberRoles(roomId, userId).filter(({ id }) => id !== newRole.id),
      newRole,
    ]);
  };
  const deleteMemberRole = (roomId: string, userId: string, roleId: string) => {
    mutateMemberRoles(
      roomId,
      userId,
      getMemberRoles(roomId, userId).filter(({ id }) => id !== roleId),
    );
  };

  const readRoles = async (input: ReadRolesInput) => {
    const fetchedRoles = await $trpc.role.readRoles.query(input);
    const roomIdRolesMap = Object.groupBy(fetchedRoles, ({ roomId }) => roomId);
    for (const roomId of input.roomIds) {
      const roomRoles = roomIdRolesMap[roomId] ?? [];
      setRoles(roomId, roomRoles);

      const roomSelectedRoleId = getSelectedRoleId(roomId);
      if (roomSelectedRoleId && roomRoles.some(({ id }) => id === roomSelectedRoleId)) continue;
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
    const userIdMemberRolesMap = Object.groupBy(memberRoles, ({ userId }) => userId);
    for (const userId of input.userIds)
      setMemberRoles(
        input.roomId,
        userId,
        (userIdMemberRolesMap[userId] ?? []).map(({ role }) => role),
      );
  };
  const { executeMutation: executeCreateRoleMutation } = useMutation();
  const { executeMutation: executeUpdateRoleMutation } = useMutation();
  const { executeMutation: executeDeleteRoleMutation } = useMutation();
  const { executeMutation: executeAssignRoleMutation } = useMutation();
  const { executeMutation: executeRevokeRoleMutation } = useMutation();
  const createRole = async (input: CreateRoleInput) => {
    // Server-generated role — non-optimistic, applied in onSuccess. Creates have no natural entity key,
    // So each call gets a unique one — overlapping creates must never queue behind each other
    await executeCreateRoleMutation(() => $trpc.role.createRole.mutate(input), {
      key: Symbol("createRole"),
      onSuccess: (newRole) => {
        setRoles(input.roomId, [newRole, ...getRoles(input.roomId)]);
        setSelectedRoleId(input.roomId, newRole.id);
      },
    });
  };
  const updateRole = async (input: UpdateRoleInput) => {
    await executeUpdateRoleMutation(() => $trpc.role.updateRole.mutate(input), {
      // Read when the write is sent, and unwound one role at a time: restoring the list as it stood would undo
      // Every other role's edit, creation and deletion that landed while this write was in flight
      applyOptimistic: () => {
        const previousRole = getRoles(input.roomId).find(({ id }) => id === input.id);
        if (!previousRole) return noop;

        setRole(input.roomId, { ...previousRole, ...input });
        return () => {
          setRole(input.roomId, previousRole);
        };
      },
      key: input.id,
      onSuccess: (updatedRole) => {
        setRole(input.roomId, updatedRole);
      },
    });
  };
  const deleteRole = async (input: DeleteRoleInput) => {
    let isSuccessful = false;
    await executeDeleteRoleMutation(() => $trpc.role.deleteRole.mutate(input), {
      // Put back only this role, at the position it held — reinstating the list as it stood would resurrect a
      // Role another deletion already removed and drop the ones created while this write was in flight
      applyOptimistic: () => {
        const previousRoles = getRoles(input.roomId);
        const deletedIndex = previousRoles.findIndex(({ id }) => id === input.id);
        const deletedRole = previousRoles[deletedIndex];
        setRoles(
          input.roomId,
          previousRoles.filter((role) => role.id !== input.id),
        );
        return () => {
          const rolesNow = getRoles(input.roomId);
          if (!deletedRole || rolesNow.some(({ id }) => id === deletedRole.id)) return;

          setRoles(input.roomId, rolesNow.toSpliced(Math.min(deletedIndex, rolesNow.length), 0, deletedRole));
        };
      },
      key: input.id,
      onSuccess: () => {
        isSuccessful = true;
      },
    });
    return isSuccessful;
  };
  const assignRole = async (input: AssignRoleInput) => {
    if (getMemberRoles(input.roomId, input.userId).some(({ id }) => id === input.roleId)) return;
    const role = getRoles(input.roomId).find(({ id }) => id === input.roleId);
    await executeAssignRoleMutation(() => $trpc.role.assignRole.mutate(input), {
      // The room's roles are only cached once a surface has read them, so an assignment made before that has
      // Nothing to show until the server hands back the role itself
      applyOptimistic: role
        ? () => {
            setMemberRole(input.roomId, input.userId, role);
            return () => {
              deleteMemberRole(input.roomId, input.userId, role.id);
            };
          }
        : undefined,
      key: `${input.userId}${ID_SEPARATOR}${input.roleId}`,
      onSuccess: (newRole) => {
        setMemberRole(input.roomId, input.userId, newRole);
      },
    });
  };
  const revokeRole = async (input: RevokeRoleInput) => {
    await executeRevokeRoleMutation(() => $trpc.role.revokeRole.mutate(input), {
      applyOptimistic: () => {
        const revokedRole = getMemberRoles(input.roomId, input.userId).find(({ id }) => id === input.roleId);
        deleteMemberRole(input.roomId, input.userId, input.roleId);
        return () => {
          if (revokedRole) setMemberRole(input.roomId, input.userId, revokedRole);
        };
      },
      key: `${input.userId}${ID_SEPARATOR}${input.roleId}`,
    });
  };
  return {
    assignRole,
    checkHasMyPermission,
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
