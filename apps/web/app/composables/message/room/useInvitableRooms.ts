import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

// The rooms a friend can be invited into from outside the room: the reader may mint a link there, and its invites are
// Not paused. A paused room is left out rather than listed as unusable, since its link could not be sent
export const useInvitableRooms = () => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { checkHasMyPermission } = roleStore;
  const invitableRooms = computed(() =>
    rooms.value.filter(
      ({ id, isInvitePaused }) => !isInvitePaused && checkHasMyPermission(id, RoomPermission.ManageInvites),
    ),
  );

  return { invitableRooms };
};
