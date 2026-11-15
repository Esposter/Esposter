import { MemberIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserStore } from "#src/store/message/user/index";
import { useMemberStore } from "#src/store/message/user/member";

export const useMemberCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { getSlice } = memberStore;
  const userStore = useUserStore();
  const { storeRoomMembers, storeUsers } = userStore;
  usePaginationCache({
    configuration: MemberIndexedDbStoreConfiguration,
    getSlice,
    // Hydration only ever runs offline, where the server-computed totals cannot be fetched, and the cache keeps no record
    // Of whether its page is the whole list, so the cached rows are not a total. The totals stay what the store already
    // Holds for this room, which is nothing unless the server answered for it this session. Both are keyed by room, so
    // Entering a room offline finds no total it did not earn
    onHydrate: (cachedMembers, partitionKey) => {
      storeUsers(cachedMembers);
      storeRoomMembers(partitionKey, cachedMembers);
    },
    partitionKey: currentRoomId,
  });
};
