import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { compareMemberNames } from "#src/services/message/member/compareMemberNames";
import { memberTable } from "#src/services/message/member/memberTable";
import { toMemberRow } from "#src/services/message/member/toMemberRow";
import { compareLastMessageAtDescending } from "#src/services/message/room/compareLastMessageAtDescending";
import { roomTable } from "#src/services/message/room/constants";
import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { getUserToRoomPatchEntry } from "#src/services/message/userToRoom/getUserToRoomPatchEntry";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { MessageType, RoomType } from "@esposter/db-schema";
import { getOrCreate, getResultAsync, noop, RoutePath, takeOne } from "@esposter/shared";

export const useDirectMessageStore = defineStore("message/room/directMessage", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  const roomRows = view(roomTable);
  const memberRows = view(memberTable);
  const userId = useSessionUserId();
  const userStore = useUserStore();
  const { storeUser } = userStore;
  const userToRoomStore = useUserToRoomStore();
  const { getMyUserToRoom } = userToRoomStore;
  const readMyUsersToRooms = useReadMyUsersToRooms();
  // The list's cursor keeps the ids of its pages, for paging. The rows are the overlay's, read into it as each page
  // Answers
  const { items: _pageDirectMessageIds, ...restData } = useCursorPaginationData<Pick<RoomInMessage, "id">>();
  // A direct message the viewer holds a live, unhidden membership of, newest first.
  // A hidden or left one has no such membership in the view, so it leaves the list with the write or the event that
  // Took it off.
  const directMessages = computed(() =>
    roomRows.value
      .flatMap((room) => {
        if (!checkIsVersioned(room) || room.type !== RoomType.DirectMessage) return [];
        const myUserToRoom = getMyUserToRoom(room.id);
        return myUserToRoom && !myUserToRoom.isHidden ? [room] : [];
      })
      .toSorted(compareLastMessageAtDescending),
  );
  // The other participants of each direct message come from the member rows the overlay holds.
  // A removal is the tombstone that arrives, and the view drops it like any row.
  // Each is named the way the room names them, and ordered the way the server pages them.
  const participantsMap = computed(() => {
    const map = new Map<string, MemberInRoom[]>();
    for (const row of memberRows.value) {
      const user = checkIsVersioned(row) && row.userId !== userId.value ? userStore.userMap.get(row.userId) : undefined;
      if (user) getOrCreate(map, row.roomId, () => []).push({ ...user, displayName: row.displayName });
    }
    return new Map(
      Array.from(map, ([roomId, participants]): [string, MemberInRoom[]] => [
        roomId,
        participants.toSorted(compareMemberNames),
      ]),
    );
  });
  const getDirectMessageParticipants = (roomId: string) => participantsMap.value.get(roomId) ?? [];
  // Every conversation past two people is a group, which the invite dialog lists beside the friends
  const checkIsGroupDirectMessage = (roomId: string) => getDirectMessageParticipants(roomId).length > 1;
  // A read's rows and participants arrive as the overlay's rows, each participant's user with its membership
  const arriveDirectMessages = (rooms: RoomInMessage[]) => {
    for (const room of rooms) arrive(roomTable, room);
  };
  const arriveDirectMessageParticipants = (directMessageParticipants: DirectMessageParticipants[]) => {
    for (const { participants } of directMessageParticipants)
      for (const { user, ...membership } of participants) {
        storeUser(user);
        arrive(memberTable, toMemberRow(membership));
      }
  };
  const roomStore = useRoomStore();
  // A direct message is a room, and the route carries one id, so the room store's reading of it is the one this store
  // Needs
  const currentDirectMessageId = computed(() => roomStore.currentRoomId);
  const currentDirectMessage = computed(() =>
    directMessages.value.find(({ id }) => id === currentDirectMessageId.value),
  );
  // A conversation the reader is on leaves the list when its membership is removed or hidden, by whichever write or
  // Event took it off. the reader is then taken to the first conversation left, or to the messages index when none is.
  watch(directMessages, async (nextDirectMessages, previousDirectMessages) => {
    const roomId = currentDirectMessageId.value;
    const wasListed = previousDirectMessages.some(({ id }) => id === roomId);
    const isListed = nextDirectMessages.some(({ id }) => id === roomId);
    if (!wasListed || isListed) return;

    await navigateTo(
      nextDirectMessages.length > 0 ? RoutePath.Messages(takeOne(nextDirectMessages).id) : RoutePath.MessagesIndex,
      { replace: true },
    );
  });
  const dataStore = useDataStore();
  const { createMessage } = dataStore;
  // A create and an invite are awaited, since the server names the room, so no entry shows them.
  // Each is held here while it is out, which is the one pending state they show.
  const creatingFriendIds = ref(new Set<PublicUser["id"]>());
  const invitingDirectMessageIds = ref(new Set<RoomInMessage["id"]>());
  // The room the server answers with is drawn once it arrives, with the viewer's membership of it, which the
  // List needs. its id is returned, or nothing when the server refused
  const createDirectMessageRoom = async (userIds: string[]) => {
    let createdRoomId = "";
    await writeAwaited(
      async () => {
        const room = await $trpc.room.directMessage.createDirectMessage.mutate(userIds);
        await readMyUsersToRooms([room.id]);
        createdRoomId = room.id;
        return [createArrival(roomTable, room)];
      },
      { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorAlert },
    );
    return createdRoomId;
  };
  const createDirectMessage = async (userIds: string[]) => {
    const createdRoomId = await createDirectMessageRoom(userIds);
    // Whether the server kept it, so the dialog that asked stays open over a refusal
    if (!createdRoomId) return false;

    await navigateTo(RoutePath.Messages(createdRoomId));
    return true;
  };
  // The link goes into a conversation the reader is already in, so unlike inviteFriend there is no direct message to
  // Create first. the message is the reader's own.
  const inviteDirectMessage = async (roomId: string, inviteLink: string) => {
    invitingDirectMessageIds.value.add(roomId);
    await getResultAsync(() =>
      createMessage({ files: [], message: inviteLink, replyToId: null, roomId, type: MessageType.Message }),
    ).match(noop, createErrorAlert);
    invitingDirectMessageIds.value.delete(roomId);
  };
  // The invite a friend is sent creates the direct message where none exists, and the reader stays on the screen they
  // Are on. so unlike createDirectMessage this does not navigate, and the message is the reader's own.
  const inviteFriend = async (friendId: PublicUser["id"], inviteLink: string) => {
    creatingFriendIds.value.add(friendId);
    const roomId = await createDirectMessageRoom([friendId]);
    creatingFriendIds.value.delete(friendId);
    if (roomId) await inviteDirectMessage(roomId, inviteLink);
  };
  // Hiding is an entry over the viewer's own membership: the conversation leaves the list while the write is out.
  // The membership the server answers arrives at the version it names, and a refusal drops the entry, so the
  // Conversation stays.
  const hideDirectMessage = (input: HideDirectMessageInput) => {
    writeOptimistic(
      async () => createRowResponse(userToRoomTable, await $trpc.room.directMessage.hideDirectMessage.mutate(input)),
      { entry: getUserToRoomPatchEntry(userId.value, input, { isHidden: true }), onError: createErrorAlert },
    );
  };
  // A participant's removal is awaited, and the membership the server tombstoned arrives, which takes them off
  // The list. A leave is the same removal of the viewer, so a reader who leaves is taken off the conversation by the
  // Same arrival.
  const deleteDirectMessageParticipant = (roomId: string, participantId: PublicUser["id"]) =>
    writeAwaited(
      async () => [
        createArrival(
          memberTable,
          toMemberRow(
            await $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId: participantId }),
          ),
        ),
      ],
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );
  const leaveDirectMessage = (roomId: string) => deleteDirectMessageParticipant(roomId, userId.value);

  return {
    arriveDirectMessageParticipants,
    arriveDirectMessages,
    checkIsGroupDirectMessage,
    checkIsInviteDirectMessagePending: (roomId: RoomInMessage["id"]) => invitingDirectMessageIds.value.has(roomId),
    checkIsInviteFriendPending: (friendId: PublicUser["id"]) => creatingFriendIds.value.has(friendId),
    createDirectMessage,
    currentDirectMessage,
    currentDirectMessageId,
    deleteDirectMessageParticipant,
    directMessages,
    getDirectMessageParticipants,
    hideDirectMessage,
    inviteDirectMessage,
    inviteFriend,
    leaveDirectMessage,
    ...restData,
  };
});
