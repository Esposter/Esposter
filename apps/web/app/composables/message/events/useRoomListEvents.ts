import { useRoomStore } from "#src/store/message/room/index";
import { useMemberStore } from "#src/store/message/user/member";
import { useConnectionStore } from "#src/store/realtime/connection";

// The rooms a person is in change on the person's own socket: every room event that concerns the list reaches each of
// The person's tabs, and the row it names is the one written to. A direct message is a room too, so its list reads the
// Same rows
export const useRoomListEvents = () => {
  const roomStore = useRoomStore();
  const { arriveRooms } = roomStore;
  const memberStore = useMemberStore();
  const { arriveJoinedMember, arriveLeftMember } = memberStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;

  onScopeDispose(
    onUserEvent("updateRoom", (updatedRoom) => {
      arriveRooms([updatedRoom]);
    }),
  );
  // The room's last message moved it to the top of the list, which is what the list sorts by
  onScopeDispose(
    onUserEvent("roomActivity", (room) => {
      arriveRooms([room]);
    }),
  );
  // A join's participants reach the direct message list through its membership topic, not from a read made here
  onScopeDispose(
    onUserEvent("joinRoom", (joinedMember) => {
      arriveJoinedMember(joinedMember);
    }),
  );
  // A removal is the tombstone it left, which takes a participant off a conversation and the reader off a room they
  // Left
  onScopeDispose(
    onUserEvent("leaveRoom", (leftMember) => {
      arriveLeftMember(leftMember);
    }),
  );
};
