import { useMemberStore } from "@/store/message/user/member";
import { useStatusStore } from "@/store/message/user/status";
import { useConnectionStore } from "@/store/realtime/connection";
import { UserStatus } from "@esposter/db-schema";

export const useUserSubscribables = async () => {
  const currentInstance = getCurrentInstance();
  const { data: session } = await useAuthSession();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const statusStore = useStatusStore();
  const { storeStatus } = statusStore;
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;
  // Only the members the list holds are kept, and never the person's own status. A row with no status set is one the
  // Store reads as online, so the null is resolved here rather than stored
  const unregister = onRoomEvent("upsertStatus", ({ userId, ...userStatus }) => {
    const isListedMember = members.value.some(({ id }) => id === userId);
    if (isListedMember && userId !== session.value?.user.id)
      storeStatus(userId, { ...userStatus, status: userStatus.status ?? UserStatus.Online });
  });
  onUnmounted(unregister, currentInstance);
};
