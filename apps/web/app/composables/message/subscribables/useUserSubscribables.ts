import { useMemberStore } from "#src/store/message/user/member";
import { useStatusStore } from "#src/store/message/user/status";
import { useConnectionStore } from "#src/store/realtime/connection";

export const useUserSubscribables = async () => {
  const currentInstance = getCurrentInstance();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const statusStore = useStatusStore();
  const { storeStatus } = statusStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;
  const { data: session } = await useAuthSession();
  // Only the members the list holds are kept, and never the person's own status
  const unregister = onRoomEvent("upsertStatus", (userStatus) => {
    const isListedMember = members.value.some(({ id }) => id === userStatus.userId);
    if (isListedMember && userStatus.userId !== session.value?.user.id) storeStatus(userStatus);
  });
  onUnmounted(unregister, currentInstance);
};
