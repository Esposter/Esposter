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
import type {
  RevokeRoleInput,
  RoomMemberPermissionInMessage,
  RoomPermission,
  RoomRoleInMessage,
} from "@esposter/db-schema";
import type { Except } from "type-fest";

import { checkIsManageable as baseCheckIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { memberRoleChangeHooks } from "#src/services/message/member/memberRoleChangeHooks";
import { roomMemberPermissionTable, roomRoleTable, userToRoomRoleTable } from "#src/services/message/role/constants";
import { createRoleConfirmations } from "#src/services/message/role/createRoleConfirmations";
import { getAssignRoomRoleEntry } from "#src/services/message/role/getAssignRoomRoleEntry";
import { getCreateRoomRoleEntry } from "#src/services/message/role/getCreateRoomRoleEntry";
import { getDeleteMemberPermissionOverrideEntry } from "#src/services/message/role/getDeleteMemberPermissionOverrideEntry";
import { getDeleteRoomRoleEntry } from "#src/services/message/role/getDeleteRoomRoleEntry";
import { getRevokeRoomRoleEntry } from "#src/services/message/role/getRevokeRoomRoleEntry";
import { getUpdateRoomRoleEntry } from "#src/services/message/role/getUpdateRoomRoleEntry";
import { getUpsertMemberPermissionOverrideEntry } from "#src/services/message/role/getUpsertMemberPermissionOverrideEntry";
import { setRoomUsers } from "#src/services/message/room/setRoomUsers";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { MANAGEMENT_PERMISSIONS } from "#src/services/room/rbac/constants";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";
import { checkHasPermission, NO_ROW_VERSION } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { v7 } from "uuid";

// The room's derived totals are re-read through the registered hooks, since only the server's totals say what a
// Role-membership change did. Two things fire them: a write to a member's roles, and a refresh of the room's roles,
// Because a membership write publishes the room's topic that refresh watches. A read of one member's roles does not,
// Its counts the server already includes
const notifyMemberRoleChange = (roomId: string) => {
  for (const memberRoleChangeHook of memberRoleChangeHooks.hooks) memberRoleChangeHook(roomId);
};

// Each list is shown highest position first, as the server orders its roles
const comparePositionDescending = (firstRole: { position: number }, secondRole: { position: number }) =>
  secondRole.position - firstRole.position;

export const useRoleStore = defineStore("message/room/role", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const roomRoleRows = view(roomRoleTable);
  const userToRoomRoleRows = view(userToRoomRoleTable);
  const roomMemberPermissionRows = view(roomMemberPermissionTable);
  // The view lists the live rows alone: a tombstone is held so a late row loses to it, and the view leaves it out. A
  // Placeholder a write drew carries NO_ROW_VERSION, so it is listed like a row the server holds
  const liveRoles = computed(() => roomRoleRows.value.filter((row) => checkIsVersioned(row)));
  const liveMemberRoles = computed(() => userToRoomRoleRows.value.filter((row) => checkIsVersioned(row)));
  const liveMemberPermissions = computed(() => roomMemberPermissionRows.value.filter((row) => checkIsVersioned(row)));
  const roleMap = computed(() => new Map(liveRoles.value.map((roomRole) => [roomRole.id, roomRole])));
  const roomRolesMap = computed(() => Map.groupBy(liveRoles.value, ({ roomId }) => roomId));
  const getRoles = (roomId: string) => (roomRolesMap.value.get(roomId) ?? []).toSorted(comparePositionDescending);
  // A member's roles are the live assignments of live roles, by room and then by member
  const memberRoleMap = computed(() => {
    const map = new Map<string, Map<string, (typeof liveRoles.value)[number][]>>();
    for (const memberRole of liveMemberRoles.value) {
      const roomRole = roleMap.value.get(memberRole.roleId);
      if (!roomRole) continue;

      const roomMemberRoles = map.get(memberRole.roomId) ?? new Map<string, (typeof liveRoles.value)[number][]>();
      roomMemberRoles.set(memberRole.userId, [...(roomMemberRoles.get(memberRole.userId) ?? []), roomRole]);
      map.set(memberRole.roomId, roomMemberRoles);
    }
    return map;
  });
  const getMemberRoles = (roomId: string, userId: string) =>
    (memberRoleMap.value.get(roomId)?.get(userId) ?? []).toSorted(comparePositionDescending);
  // An absent member has no row, and a member with no roles has no row either. A surface that must tell them apart, a
  // Member's actions that wait for the roles to arrive, asks whether a read has answered for the member
  const { getData: getLoadedMemberIds, setData: setLoadedMemberIds } = useDataMap(
    () => roomStore.scopedRoomId,
    () => new Set<string>(),
  );
  const checkIsMemberRolesRead = (roomId: string, userId: string) => getLoadedMemberIds(roomId)?.has(userId) ?? false;
  const markMemberRolesRead = (roomId: string, userIds: string[]) => {
    setLoadedMemberIds(roomId, new Set([...(getLoadedMemberIds(roomId) ?? []), ...userIds]));
  };
  const {
    data: selectedRoleId,
    getData: getSelectedRoleId,
    setData: setSelectedRoleId,
  } = useDataMap(() => roomStore.scopedRoomId, "");
  const selectedRole = computed(() => getRoles(roomStore.scopedRoomId).find(({ id }) => id === selectedRoleId.value));
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
  // A member's override, by user id within the room. A member with no live row is absent, which reads as both bitfields
  // Zero: the roles alone
  const memberPermissionOverrideMap = computed(
    () =>
      new Map(
        liveMemberPermissions.value
          .filter(({ roomId }) => roomId === roomStore.scopedRoomId)
          .map(({ allow, deny, userId }) => [userId, { allow, deny }] as const),
      ),
  );
  const getMemberPermissionOverride = (roomId: string, userId: string): MemberPermissionOverride => {
    const memberPermission = liveMemberPermissions.value.find((row) => row.roomId === roomId && row.userId === userId);
    return memberPermission ? { allow: memberPermission.allow, deny: memberPermission.deny } : { allow: 0n, deny: 0n };
  };
  // Reads arrive the rows they return as they stand, tombstones included, so each one is held at its version and a
  // Removal the read carries replaces the live copy the store held before
  const arriveRoomRoles = (roomRoles: RoomRoleInMessage[]) => {
    for (const roomRole of roomRoles) arrive(roomRoleTable, roomRole);
  };
  // The store's reads of a room are live: each room is one target of the store's own instance, so a write in that room
  // Re-reads the room's answer and the rooms do not supersede one another. A read its caller awaits still throws on
  // Failure, as the raw query did; the refresh a watch runs has no caller, so it logs instead
  const readRoomRoleRows = useOverlayRead(roomRoleTable, (roomRole: RoomRoleInMessage) => roomRole);
  const readRoles = async ({ roomIds }: ReadRolesInput) => {
    await Promise.all(
      roomIds.map((roomId) => {
        // Only a read made after the room's roles were held is a refresh, which is when the totals move
        const isRefresh = roomRolesMap.value.has(roomId);
        return rethrowFailedRead(
          readRoomRoleRows(() => $trpc.role.readRoles.query({ roomIds: [roomId] }), {
            key: roomId,
            onError: console.error,
            onSuccess: () => {
              const roomLiveRoles = getRoles(roomId);
              if (!roomLiveRoles.some(({ id }) => id === getSelectedRoleId(roomId))) {
                const everyoneRole = roomLiveRoles.find(({ isEveryone }) => isEveryone);
                setSelectedRoleId(roomId, (everyoneRole ?? roomLiveRoles[0])?.id ?? "");
              }
              if (isRefresh) notifyMemberRoleChange(roomId);
            },
          }),
        );
      }),
    );
  };
  const { executeQuery: executeReadMyPermissionsQuery } = useMutation();
  const runScope = useRunScope();
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
            runScope,
          }),
        ),
      ),
    );
  };
  const readMemberPermissionOverrideRows = useOverlayRead(
    roomMemberPermissionTable,
    (memberPermission: RoomMemberPermissionInMessage) => memberPermission,
  );
  const readMemberPermissionOverrides = async (input: ReadMemberPermissionOverridesInput) => {
    await rethrowFailedRead(
      readMemberPermissionOverrideRows(() => $trpc.role.readMemberPermissionOverrides.query(input), {
        key: input.roomId,
        onError: console.error,
        onSuccess: async (overrides) => {
          // An override names no one, so the rows of the users it holds are read alongside it. Its failure is logged
          // Rather than thrown, since a refresh that throws has no caller to catch it. A tombstone names no user to read
          const overriddenUserIds = overrides.filter(({ deletedAt }) => !deletedAt).map(({ userId }) => userId);
          if (overriddenUserIds.length === 0) return;

          await getResultAsync(() =>
            $trpc.room.readUsersByIds.query({ roomId: input.roomId, userIds: overriddenUserIds }),
          ).match((users) => {
            setRoomUsers(input.roomId, users);
          }, console.error);
        },
      }),
    );
  };
  // The role is drawn under the id the client gives it, at a placeholder with no version. The server's row arrives in its
  // Answer, and the header confirms the placeholder at the version it names. The role is selected at once
  const createRole = (input: Except<CreateRoleInput, "id">) => {
    const now = new Date();
    const roomRole: RoomRoleInMessage = {
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
    setSelectedRoleId(input.roomId, roomRole.id);
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.role.createRole.mutate({ ...input, id: roomRole.id }),
        );
        return { arrivals: [createArrival(roomRoleTable, result)], confirmed: createRoleConfirmations(rowVersions) };
      },
      { entry: getCreateRoomRoleEntry(roomRole), onError: createErrorAlert },
    );
  };
  const updateRole = (input: UpdateRoleInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.role.updateRole.mutate(input));
        return { arrivals: [createArrival(roomRoleTable, result)], confirmed: createRoleConfirmations(rowVersions) };
      },
      { entry: getUpdateRoomRoleEntry(input), onError: createErrorAlert },
    );
  };
  const deleteRole = (input: DeleteRoleInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.role.deleteRole.mutate(input));
        return { arrivals: [createArrival(roomRoleTable, result)], confirmed: createRoleConfirmations(rowVersions) };
      },
      { entry: getDeleteRoomRoleEntry(input.id, new Date()), onError: createErrorAlert },
    );
  };
  // A role the room's list holds is drawn on the member at once. The answer carries the role with the assignment, so a
  // Role the client does not hold yet is held by the same answer
  const assignRole = (input: AssignRoleInput) => {
    if (getMemberRoles(input.roomId, input.userId).some(({ id }) => id === input.roleId)) return;

    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.role.assignRole.mutate(input));
        const { role, ...memberRole } = result;
        return {
          arrivals: [createArrival(roomRoleTable, role), createArrival(userToRoomRoleTable, memberRole)],
          confirmed: createRoleConfirmations(rowVersions),
        };
      },
      {
        entry: getAssignRoomRoleEntry(input.roomId, input.userId, input.roleId, new Date()),
        onError: createErrorAlert,
      },
    );
  };
  const revokeRole = (input: RevokeRoleInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.role.revokeRole.mutate(input));
        return {
          arrivals: result.map((memberRole) => createArrival(userToRoomRoleTable, memberRole)),
          confirmed: createRoleConfirmations(rowVersions),
        };
      },
      {
        entry: getRevokeRoomRoleEntry(input.roomId, input.userId, input.roleId, new Date()),
        onError: createErrorAlert,
      },
    );
  };
  // The override is drawn at once from the one the member has now. The server's own merge is what it stores, so its
  // Answer corrects the drawn row, and a rejection drops the drawn row
  const upsertMemberPermissionOverride = (input: UpsertMemberPermissionOverrideInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.role.upsertMemberPermissionOverride.mutate(input),
        );
        return {
          arrivals: result.map((memberPermission) => createArrival(roomMemberPermissionTable, memberPermission)),
          confirmed: createRoleConfirmations(rowVersions),
        };
      },
      { entry: getUpsertMemberPermissionOverrideEntry(input, new Date()), onError: createErrorAlert },
    );
  };
  const deleteMemberPermissionOverride = (input: DeleteMemberPermissionOverrideInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.role.deleteMemberPermissionOverride.mutate(input),
        );
        return {
          arrivals: result.map((memberPermission) => createArrival(roomMemberPermissionTable, memberPermission)),
          confirmed: createRoleConfirmations(rowVersions),
        };
      },
      {
        entry: getDeleteMemberPermissionOverrideEntry(input.roomId, input.userId, new Date()),
        onError: createErrorAlert,
      },
    );
  };
  return {
    arriveRoomRoles,
    assignRole,
    checkHasMyPermission,
    checkIsManageable,
    checkIsMemberRolesRead,
    checkIsRoleManageable,
    createRole,
    deleteMemberPermissionOverride,
    deleteRole,
    getMemberPermissionOverride,
    getMemberRoles,
    getMyPermissions,
    getRoles,
    markMemberRolesRead,
    memberPermissionOverrideMap,
    myPermissions,
    notifyMemberRoleChange,
    readMemberPermissionOverrides,
    readMyPermissions,
    readRoles,
    revokeRole,
    selectedMemberId,
    selectedRole,
    selectedRoleId,
    selectMember,
    selectRole,
    updateRole,
    upsertMemberPermissionOverride,
  };
});
