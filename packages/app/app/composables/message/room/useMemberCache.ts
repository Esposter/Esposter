import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

export const useMemberCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { count, members } = storeToRefs(memberStore);
  const { initializeCursorPaginationData } = memberStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  return useCursorPaginationCache({
    configuration: MemberIndexedDbStoreConfiguration,
    initializeCursorPaginationData,
    items: members,
    onHydrate: (cachedMembers) => {
      count.value = cachedMembers.length;
      storeUsers(cachedMembers);
    },
    partitionKey: currentRoomId,
  });
};
