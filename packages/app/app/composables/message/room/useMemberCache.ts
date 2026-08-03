import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

export const useMemberCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { count, countsByTopRole, members } = storeToRefs(memberStore);
  const { initializeCursorPaginationData } = memberStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  useCursorPaginationCache({
    configuration: MemberIndexedDbStoreConfiguration,
    initializeCursorPaginationData,
    items: members,
    // Hydration only ever runs offline, where the two server-computed totals cannot be fetched. The cached page
    // Is the whole of what this room can show, so it is also the only honest total; the per-role breakdown has
    // No offline equivalent at all and is dropped rather than left reading the last room the network answered for
    onHydrate: (cachedMembers) => {
      count.value = cachedMembers.length;
      countsByTopRole.value = [];
      storeUsers(cachedMembers);
    },
    partitionKey: currentRoomId,
  });
};
