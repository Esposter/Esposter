import type { MemberRow } from "#shared/models/db/room/MemberRow";
import type { MemberRowInRoom } from "#shared/models/db/room/MemberRowInRoom";
import type { CursorPaginationSlice } from "#src/models/pagination/cursor/CursorPaginationSlice";
import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Page, PublicUser } from "@esposter/db-schema";

import { MemberCounts } from "#src/models/message/user/MemberCounts";
import { foldAsciiCase } from "#src/services/message/member/foldAsciiCase";
import { getMemberRowKey } from "#src/services/message/member/getMemberRowKey";
import { getRenameMemberEntry } from "#src/services/message/member/getRenameMemberEntry";
import { memberRoleChangeHooks } from "#src/services/message/member/memberRoleChangeHooks";
import { memberTable } from "#src/services/message/member/memberTable";
import { toMemberRow } from "#src/services/message/member/toMemberRow";
import { createBatchedRefresh } from "#src/services/shared/createBatchedRefresh";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { compareText, getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

// A list names each of its members by the room and the user, and the rows themselves are the overlay's
type MemberKey = Pick<MemberRow, "roomId" | "userId">;

// A row the view shows is held at a version, unless a draft created it, and a placeholder holds none until its answer names one
const checkIsHeldRow = (row: Readonly<Draft<MemberRow>>): row is MemberRow => row.version !== undefined;

// A room's rows by user, from the rows the view shows. A removed membership is not shown, so it is not in the map
const getRoomMemberRows = (memberRows: readonly Readonly<Draft<MemberRow>>[], roomId: string | undefined) =>
  new Map(
    memberRows.flatMap((row): [string, MemberRow][] =>
      checkIsHeldRow(row) && row.roomId === roomId ? [[row.userId, row]] : [],
    ),
  );

// Joins a list's keys to the room's rows and their users, each pair shaped by `project`. A key without both is left out
const joinListedMembers = <T>(
  keys: readonly MemberKey[],
  roomMemberRows: ReadonlyMap<string, MemberRow>,
  users: ReadonlyMap<string, PublicUser>,
  project: (user: PublicUser, row: MemberRow) => T,
): T[] =>
  keys.flatMap(({ userId }) => {
    const row = roomMemberRows.get(userId);
    const user = users.get(userId);
    return row && user ? [project(user, row)] : [];
  });

export const useMemberStore = defineStore("message/user/member", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const roleStore = useRoleStore();
  const { mutateMemberRoles } = roleStore;
  const userStore = useUserStore();
  const { storeRoomMembers, storeUser, userMap } = userStore;
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const memberRows = view(memberTable);
  // Keyed by room, like messages. A single global list would still hold the previous room's members after a switch,
  // which is unreadable state for anything asking "are these rows this room's" — the offline cache asks exactly that
  const {
    getSlice,
    items: listedMemberKeys,
    ...restData
  } = useCursorPaginationDataMap<MemberKey>(() => roomStore.scopedRoomId);
  // Sorted the way the server pages them: a display name compared case-insensitively and then byte by byte, the same
  // comparison on the same display name, and then the id. The list is one order whether it was read in pages or joined
  // live. A locale collation has no SQLite counterpart, so a list sorted by one would not be the order the cursor advances
  const members = computed(() => {
    const roomMemberRows = getRoomMemberRows(memberRows.value, roomStore.scopedRoomId);
    return joinListedMembers(listedMemberKeys.value, roomMemberRows, userMap, (user, row) => ({
      ...user,
      displayName: row.displayName,
    })).toSorted(
      (firstMember, secondMember) =>
        compareText(foldAsciiCase(firstMember.displayName), foldAsciiCase(secondMember.displayName)) ||
        compareText(firstMember.id, secondMember.id),
    );
  });
  // Server-computed totals for the member list headers — the paginated items only hold loaded pages. Keyed by
  // Room for the same reason the list is: they describe one room, only the network can produce them, and a
  // Switch made offline would otherwise leave the room being entered wearing the totals of the one just left
  const { data: memberCounts, getDataRef: getMemberCountsRef } = useDataMap(
    () => roomStore.scopedRoomId,
    () => new MemberCounts(),
  );
  // Reading views, like `members` above: every write names its room — the refresh takes the room it was read for
  const memberCount = computed(() => memberCounts.value.memberCount);
  const memberCountsByTopRole = computed(() => memberCounts.value.countsByTopRole);
  // The totals are never adjusted by a delta: a delta applied on top of a read that already counted the change counts
  // It twice, and a delta applied to a group the store never saw the member in is wrong for good. Every change marks its
  // Room, and the batched refresh re-reads the marked rooms one run at a time, so no two reads of a room overlap
  const refreshMemberCounts = createBatchedRefresh(async (roomIds: string[]) => {
    await Promise.all(
      roomIds.map(async (roomId) => {
        const [count, countsByTopRole] = await Promise.all([
          $trpc.room.readMembersCount.query({ roomId }),
          $trpc.room.readMemberCountsByTopRole.query({ roomId }),
        ]);
        const roomMemberCounts = getMemberCountsRef(roomId).value;
        roomMemberCounts.memberCount = count;
        roomMemberCounts.countsByTopRole = countsByTopRole;
      }),
    );
  });
  const refreshMemberCountsInBackground = getSynchronizedFunction((roomId: string) =>
    getResultAsync(() => refreshMemberCounts([roomId])).match(noop, console.error),
  );
  // Every role-membership write re-reads its room's totals, so a leave, a role change, and a committed optimistic write
  // Reach them through the same path. The room is the one the write happened in, not necessarily the one open
  // On Screen — a role assigned from a profile card in one room while another is open belongs to that room's totals
  memberRoleChangeHooks.register(refreshMemberCountsInBackground);
  // A page of a room's members arrives row by row, and the page's keys keep the order the server gave them, so the cursor
  // advances from the place the page left and the list shows each row the overlay holds for its key
  const arriveMemberPage = ({ items: pageMembers, ...page }: Page<MemberRowInRoom>): Page<MemberKey> => {
    for (const member of pageMembers) arrive(memberTable, toMemberRow(member));
    return { ...page, items: pageMembers.map(({ roomId, userId }) => ({ roomId, userId })) };
  };
  // A member who joins arrives as the row the join announced, and is listed at the end of the room's list as they were
  const arriveJoinedMember = ({ user, ...joinedMember }: MemberRow & { user: PublicUser }) => {
    storeUser(user);
    arrive(memberTable, toMemberRow(joinedMember));
    const { roomId, userId } = joinedMember;
    const { items } = getSlice(roomId);
    if (!items.value.some((key) => key.userId === userId)) items.value.push({ roomId, userId });
    refreshMemberCountsInBackground(roomId);
  };
  // A member who leaves arrives as the tombstone the removal left, which the list drops once it is held. Their roles go with
  // them, and the role change's own hook re-reads the room's totals
  const arriveLeftMember = (leftMember: MemberRow) => {
    arrive(memberTable, toMemberRow(leftMember));
    mutateMemberRoles(leftMember.roomId, leftMember.userId, []);
  };
  // A saved display name is an optimistic write over the member's row. The entry shows the name the server will resolve,
  // and the answer is the row itself, which arrives at the version it names and settles the write
  const renameMember = (roomId: string, userId: string, displayName: string) => {
    const accountName = userMap.get(userId)?.name ?? "";
    writeOptimistic(
      async () => {
        const updatedMembership = await $trpc.userToRoom.updateUserToRoom.mutate({
          displayName,
          roomId,
          targetUserId: userId,
        });
        const row = toMemberRow(updatedMembership);
        // The room's names follow the row the answer holds, so the messages a member wrote show the name the room now gives them
        const user = userMap.get(userId);
        if (user) storeRoomMembers(roomId, [{ ...user, displayName: row.displayName }]);
        return {
          arrivals: [createArrival(memberTable, row)],
          confirmed: [createConfirmation(memberTable, getMemberRowKey(userId, roomId), row.version)],
        };
      },
      { entry: getRenameMemberEntry(roomId, userId, displayName, accountName), onError: createErrorAlert },
    );
  };
  // The offline cache keeps a room's members as the rows they are shown with, and restores them into the overlay by their
  // versions, so the list's keys follow the restored rows. The rows are the ones the overlay shows for the room
  const getCacheSlice = (roomId: string): CursorPaginationSlice<MemberRowInRoom> => {
    const slice = getSlice(roomId);
    return {
      initializeCursorPaginationData: ({ items: cachedMembers, nextCursor }) => {
        for (const member of cachedMembers) arrive(memberTable, toMemberRow(member));
        slice.initializeCursorPaginationData({
          items: cachedMembers.map(({ roomId: cachedRoomId, userId }) => ({ roomId: cachedRoomId, userId })),
          nextCursor,
        });
      },
      isLoaded: slice.isLoaded,
      items: computed(() => {
        const roomMemberRows = getRoomMemberRows(memberRows.value, roomId);
        return joinListedMembers(slice.items.value, roomMemberRows, userMap, (user, row) => ({ ...user, ...row }));
      }),
      resetCursorPaginationData: slice.resetCursorPaginationData,
    };
  };

  return {
    arriveJoinedMember,
    arriveLeftMember,
    arriveMemberPage,
    getCacheSlice,
    memberCount,
    memberCountsByTopRole,
    members,
    refreshMemberCounts,
    renameMember,
    ...restData,
  };
});
