import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useMemberStore } from "@/store/message/user/member";
import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop, RoutePath, takeOne } from "@esposter/shared";

// The rooms a person is in, and the direct messages among them, change on the person's own socket: every room event
// That concerns the list reaches each of the person's tabs, and the room it names is the one written to
export const useRoomListEvents = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { storeDeleteRoom, storeUpdateRoom } = roomStore;
  const memberStore = useMemberStore();
  const { storeCreateMember, storeDeleteMember } = memberStore;
  const directMessageStore = useDirectMessageStore();
  const {
    storeDeleteDirectMessage,
    storeDeleteDirectMessageParticipant,
    storeDirectMessageParticipants,
    storeUpdateDirectMessage,
  } = directMessageStore;
  const { directMessages } = storeToRefs(directMessageStore);
  const session = authClient.useSession();
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;

  onScopeDispose(
    onUserEvent("updateRoom", (updatedRoom) => {
      storeUpdateRoom(updatedRoom);
      storeUpdateDirectMessage(updatedRoom);
    }),
  );
  // The room's last message moved it to the top of the list, which is what the list sorts by
  onScopeDispose(
    onUserEvent("roomActivity", ({ id, updatedAt }) => {
      storeUpdateRoom({ id, updatedAt });
      storeUpdateDirectMessage({ id, updatedAt });
    }),
  );
  onScopeDispose(
    onUserEvent(
      "deleteRoom",
      getSynchronizedFunction(({ roomId }) =>
        getResultAsync(() => storeDeleteRoom({ id: roomId })).match(noop, console.error),
      ),
    ),
  );
  onScopeDispose(
    onUserEvent("joinRoom", ({ displayName, roomId, user }) => {
      storeCreateMember(roomId, { ...user, displayName });
    }),
  );
  onScopeDispose(
    onUserEvent(
      "joinRoom",
      getSynchronizedFunction(({ roomId }) =>
        getResultAsync(async () => {
          const directMessageParticipants = await $trpc.room.directMessage.readDirectMessageParticipants.query([
            roomId,
          ]);
          const directMessage = directMessageParticipants.find((item) => item.roomId === roomId);
          if (directMessage) storeDirectMessageParticipants(roomId, directMessage.participants);
        }).match(noop, console.error),
      ),
    ),
  );
  onScopeDispose(
    onUserEvent("leaveRoom", ({ roomId, userId }) => {
      storeDeleteMember(roomId, userId);
    }),
  );
  onScopeDispose(
    onUserEvent(
      "leaveRoom",
      getSynchronizedFunction(({ roomId, userId }) =>
        getResultAsync(async () => {
          if (userId === session.value.data?.user.id) {
            storeDeleteDirectMessage({ id: roomId });
            await navigateTo(
              directMessages.value.length > 0
                ? RoutePath.Messages(takeOne(directMessages.value).id)
                : RoutePath.MessagesIndex,
              { replace: true },
            );
          } else storeDeleteDirectMessageParticipant(roomId, userId);
        }).match(noop, console.error),
      ),
    ),
  );
};
