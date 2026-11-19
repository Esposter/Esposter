import type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
import type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
import type { DeleteMemberPermissionOverrideInput } from "#shared/models/db/role/DeleteMemberPermissionOverrideInput";
import type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { ReadMemberPermissionOverridesInput } from "#shared/models/db/role/ReadMemberPermissionOverridesInput";
import type { ReadMyPermissionsInput } from "#shared/models/db/role/ReadMyPermissionsInput";
import type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { UpsertMemberPermissionOverrideInput } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";
import type { RevokeRoleInput, RoomPermission, RoomRoleInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { checkIsManageable as baseCheckIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { mergeMemberPermissionOverride } from "#shared/services/room/rbac/mergeMemberPermissionOverride";
import { memberRoleChangeHooks } from "#src/services/message/member/memberRoleChangeHooks";
import { MANAGEMENT_PERMISSIONS } from "#src/services/room/rbac/constants";
import { getRestoredItems } from "#src/services/shared/getRestoredItems";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserStore } from "#src/store/message/user/index";
import { checkHasPermission, NO_ROW_VERSION } from "@esposter/db-schema";
import { getResultAsync, ID_SEPARATOR, noop, omitUndefined } from "@esposter/shared";
import { v7 } from "uuid";

// The room's derived totals are re-read through the registered hooks, since only the server's totals say what a
// Role-membership change did. Two things fire them: a write to a member's roles, and a refresh of the room's roles,
// Because a membership write publishes the room's topic that refresh watches. A read of one member's roles does not,
// Its counts the server already includes
const notifyMemberRoleChange = (roomId: string) => {
  for (const memberRoleChangeHook of memberRoleChangeHooks.hooks) memberRoleChangeHook(roomId);
};

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const userStore = useUserStore();
  const { storeRoomMembers } = userStore;
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
  // A role and a member are one selection between them, so picking either clears the other
  const selectRole = (id: string) => {
    selectedRoleId.value = id;
    selectedMemberId.value = "";
  };
  const {
    data: myPermissions,
    getData: getMyPermissions,
    setData: setMyPermissions,
  } = useDataMap(() => roomStore.scopedRoomId, { isRoomOwner: false, permissions: 0n, topRolePosition: -1 });
  const { data: selectedMemberId } = useDataMap(() => roomStore.scopedRoomId, "");
  const selectMember = (id: string) => {
    selectedMemberId.value = id;
    selectedRoleId.value = "";
  };
  // Owner bypass and the bitfield test are one question, and every surface that gates on a permission asks it
  // The same way — a caller reading `permissions` on its own silently drops the bypass
  const checkHasMyPermission = (roomId: string, permission: RoomPermission) => {
    const myRoomPermissions = getMyPermissions(roomId);
    if (myRoomPermissions)
      return checkHasPermission(myRoomPermissions.permissions, permission, myRoomPermissions.isRoomOwner);
    else return false;
  };
  const checkIsManageable = (roomId: string) => {
    const roomPermissions = getMyPermissions(roomId);
    if (roomPermissions)
      return (
        baseCheckIsManageable(roomPermissions.topRolePosition, 0, roomPermissions.isRoomOwner) ||
        Boolean(roomPermissions.permissions & MANAGEMENT_PERMISSIONS)
      );
    else return false;
  };
  // A role is changed or deleted only by a reader who outranks it, so every surface that offers one asks it this way
  const checkIsRoleManageable = (roomId: string, rolePosition: number) => {
    const roomPermissions = getMyPermissions(roomId);
    if (roomPermissions)
      return baseCheckIsManageable(roomPermissions.topRolePosition, rolePosition, roomPermissions.isRoomOwner);
    else return false;
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
  // Every role-membership MUTATION funnels through here, and every hook is told of every write, not only of a top-role
  // Change: a write that leaves the top role alone can still be the server's commit of an optimistic one
  const mutateMemberRoles = (roomId: string, userId: string, newRoles: RoomRoleInMessage[]) => {
    setMemberRoles(roomId, userId, newRoles);
    notifyMemberRoleChange(roomId);
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
  // A member's override, keyed by user id within the room. A member with no row is absent, which reads as both
  // Bitfields zero — the roles alone — so the map only ever holds the members an override actually changes
  const {
    data: memberPermissionOverrideMap,
    getData: getMemberPermissionOverrideMap,
    setData: setMemberPermissionOverrideMap,
  } = useDataMap(() => roomStore.scopedRoomId, new Map<string, MemberPermissionOverride>());
  const getMemberPermissionOverride = (roomId: string, userId: string) =>
    getMemberPermissionOverrideMap(roomId)?.get(userId) ?? { allow: 0n, deny: 0n };
  const setMemberPermissionOverride = (roomId: string, userId: string, override: MemberPermissionOverride) => {
    const roomOverrideMap = new Map(getMemberPermissionOverrideMap(roomId));
    if (override.allow | override.deny) roomOverrideMap.set(userId, override);
    else roomOverrideMap.delete(userId);
    setMemberPermissionOverrideMap(roomId, roomOverrideMap);
  };

  // The store's reads of a room are live: each room is one target of the store's own instance, so a write in that room
  // Re-reads the room's answer and the rooms do not supersede one another. A read its caller awaits still throws on
  // Failure, as the raw query did; the refresh a watch runs has no caller, so it logs instead
  const { executeQuery: executeReadRolesQuery } = useMutation();
  const readRoles = async ({ roomIds }: ReadRolesInput) => {
    await Promise.all(
      roomIds.map((roomId) =>
        rethrowFailedRead(
          executeReadRolesQuery(() => $trpc.role.readRoles.query({ roomIds: [roomId] }), {
            key: roomId,
            onError: console.error,
            onSuccess: (roomRoles) => {
              // Only a read made after the room's roles were held is a refresh, which is when the totals move
              const isRefresh = baseGetRoles(roomId) !== undefined;
              setRoles(roomId, roomRoles);

              const roomSelectedRoleId = getSelectedRoleId(roomId);
              if (!roomSelectedRoleId || !roomRoles.some(({ id }) => id === roomSelectedRoleId)) {
                const everyoneRole = roomRoles.find(({ isEveryone }) => isEveryone);
                setSelectedRoleId(roomId, (everyoneRole ?? roomRoles[0])?.id ?? "");
              }
              if (isRefresh) notifyMemberRoleChange(roomId);
            },
          }),
        ),
      ),
    );
  };
  const { executeQuery: executeReadMyPermissionsQuery } = useMutation();
  const readMyPermissions = async ({ roomIds }: ReadMyPermissionsInput) => {
    await Promise.all(
      roomIds.map((roomId) =>
        rethrowFailedRead(
          executeReadMyPermissionsQuery(() => $trpc.role.readMyPermissions.query({ roomIds: [roomId] }), {
            key: roomId,
            onError: console.error,
            onSuccess: (roomPermissionsList) => {
              for (const { roomId: permissionRoomId, ...rest } of roomPermissionsList)
                setMyPermissions(permissionRoomId, rest);
            },
          }),
        ),
      ),
    );
  };
  const { executeMutation: executeCreateRoleMutation } = useMutation();
  // The writes that end one row share a queue named for that row, so each unwinds against what the one before it left
  const { executeMutation: executeRoleMutation } = useMutation();
  const { executeMutation: executeMemberRoleMutation } = useMutation();
  const { executeMutation: executeMemberPermissionOverrideMutation } = useMutation();
  const { executeQuery: executeReadMemberPermissionOverridesQuery } = useMutation();
  const readMemberPermissionOverrides = async (input: ReadMemberPermissionOverridesInput) => {
    await rethrowFailedRead(
      executeReadMemberPermissionOverridesQuery(() => $trpc.role.readMemberPermissionOverrides.query(input), {
        key: input.roomId,
        onError: console.error,
        onSuccess: async (overrides) => {
          setMemberPermissionOverrideMap(
            input.roomId,
            new Map(overrides.map(({ allow, deny, userId }) => [userId, { allow, deny }])),
          );
          // An override names no one, so the rows of the overridden users are read alongside it. Its failure is
          // Logged rather than thrown, since a refresh that throws has no caller to catch it
          if (overrides.length === 0) return;

          await getResultAsync(() =>
            $trpc.room.readUsersByIds.query({ roomId: input.roomId, userIds: overrides.map(({ userId }) => userId) }),
          ).match((users) => {
            storeRoomMembers(input.roomId, users);
          }, console.error);
        },
      }),
    );
  };
  // The entry is drawn at once from the one held: the bits the write allows or denies move into their state, a bit it
  // Names in none of the three keeps the state it had, and a bit it returns to the roles is cleared. A rejection puts
  // Back the entry the write found. The server's own merge is what it stores, so its answer corrects the entry drawn
  const upsertMemberPermissionOverride = (input: UpsertMemberPermissionOverrideInput) => {
    executeMemberPermissionOverrideMutation(() => $trpc.role.upsertMemberPermissionOverride.mutate(input), {
      applyOptimistic: () => {
        const previousOverride = getMemberPermissionOverride(input.roomId, input.userId);
        setMemberPermissionOverride(input.roomId, input.userId, mergeMemberPermissionOverride(previousOverride, input));
        return () => {
          setMemberPermissionOverride(input.roomId, input.userId, previousOverride);
        };
      },
      key: `${input.roomId}${ID_SEPARATOR}${input.userId}`,
      reconcile: (override) => {
        setMemberPermissionOverride(input.roomId, input.userId, override);
      },
    });
  };
  const deleteMemberPermissionOverride = (input: DeleteMemberPermissionOverrideInput) => {
    executeMemberPermissionOverrideMutation(() => $trpc.role.deleteMemberPermissionOverride.mutate(input), {
      // Removing the entry returns the member to their roles alone, which is the state the entry is drawn in
      applyOptimistic: () => {
        const previousOverride = getMemberPermissionOverride(input.roomId, input.userId);
        setMemberPermissionOverride(input.roomId, input.userId, { allow: 0n, deny: 0n });
        return () => {
          setMemberPermissionOverride(input.roomId, input.userId, previousOverride);
        };
      },
      key: `${input.roomId}${ID_SEPARATOR}${input.userId}`,
    });
  };
  // The role is created under the id the client gives it, and the server stores the row as given, so it is drawn and
  // Selected at once. The room's own event skips the sender, so nothing draws it a second time
  const createRole = (input: Except<CreateRoleInput, "id">) => {
    const now = new Date();
    const newRole: RoomRoleInMessage = {
      color: input.color ?? "",
      createdAt: now,
      deletedAt: null,
      id: v7(),
      isEveryone: false,
      name: input.name,
      permissions: input.permissions,
      position: input.position,
      roomId: input.roomId,
      updatedAt: now,
      version: NO_ROW_VERSION,
    };
    executeCreateRoleMutation(() => $trpc.role.createRole.mutate({ ...input, id: newRole.id }), {
      applyOptimistic: () => {
        const previousSelectedRoleId = getSelectedRoleId(input.roomId) ?? "";
        setRoles(input.roomId, [newRole, ...getRoles(input.roomId)]);
        setSelectedRoleId(input.roomId, newRole.id);
        return () => {
          setRoles(
            input.roomId,
            getRoles(input.roomId).filter(({ id }) => id !== newRole.id),
          );
          if (getSelectedRoleId(input.roomId) === newRole.id) setSelectedRoleId(input.roomId, previousSelectedRoleId);
        };
      },
      key: newRole.id,
    });
  };
  const updateRole = (input: UpdateRoleInput) => {
    executeRoleMutation(() => $trpc.role.updateRole.mutate(input), {
      // Read when the write is sent, and unwound one role at a time
      applyOptimistic: () => {
        const previousRole = getRoles(input.roomId).find(({ id }) => id === input.id);
        if (!previousRole) return noop;

        setRole(input.roomId, { ...previousRole, ...omitUndefined(input) });
        return () => {
          setRole(input.roomId, previousRole);
        };
      },
      key: input.id,
      reconcile: (updatedRole) => {
        setRole(input.roomId, updatedRole);
      },
    });
  };
  const deleteRole = (input: DeleteRoleInput) => {
    executeRoleMutation(() => $trpc.role.deleteRole.mutate(input), {
      // Put back only this role, at the position it held
      applyOptimistic: () => {
        const previousRoles = getRoles(input.roomId);
        const deletedIndex = previousRoles.findIndex(({ id }) => id === input.id);
        const deletedRole = previousRoles[deletedIndex];
        setRoles(
          input.roomId,
          previousRoles.filter((role) => role.id !== input.id),
        );
        return () => {
          if (deletedRole) setRoles(input.roomId, getRestoredItems(getRoles(input.roomId), deletedRole, deletedIndex));
        };
      },
      key: input.id,
    });
  };
  // A role the room's list holds is drawn on the member at once. The room's roles are only cached once a surface has
  // Read them, so one it has not read yet is drawn from the row the server answers with, the only row to draw it from
  const assignRole = (input: AssignRoleInput) => {
    if (getMemberRoles(input.roomId, input.userId).some(({ id }) => id === input.roleId)) return;
    const role = getRoles(input.roomId).find(({ id }) => id === input.roleId);
    executeMemberRoleMutation(() => $trpc.role.assignRole.mutate(input), {
      applyOptimistic: () => {
        if (!role) return noop;

        setMemberRole(input.roomId, input.userId, role);
        return () => {
          deleteMemberRole(input.roomId, input.userId, role.id);
        };
      },
      key: `${input.userId}${ID_SEPARATOR}${input.roleId}`,
      reconcile: (newRole) => {
        if (!role) setMemberRole(input.roomId, input.userId, newRole);
      },
    });
  };
  const revokeRole = (input: RevokeRoleInput) => {
    executeMemberRoleMutation(() => $trpc.role.revokeRole.mutate(input), {
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
    checkIsRoleManageable,
    createRole,
    deleteMemberPermissionOverride,
    deleteRole,
    getMemberPermissionOverride,
    getMemberRoleMap,
    getMemberRoles,
    getMyPermissions,
    getRoles,
    memberPermissionOverrideMap,
    memberRoleMap,
    mutateMemberRoles,
    myPermissions,
    readMemberPermissionOverrides,
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
    upsertMemberPermissionOverride,
  };
});
