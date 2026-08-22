import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

export const useMemberCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { count } = storeToRefs(memberStore);
  const { getSlice } = memberStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  useCursorPaginationCache({
    configuration: MemberIndexedDbStoreConfiguration,
    // The room the cache is acting on names its own slice, so neither half can read or restore the list of a room
    // The reader has switched to since
    getSlice,
    // Hydration only ever runs offline, where the server-computed total cannot be fetched. The cached page is
    // The whole of what this room can show, so it is also the only honest total. The per-role breakdown is left
    // Alone: it is keyed by room in the store, so entering a room offline already finds it empty
    onHydrate: (cachedMembers) => {
      count.value = cachedMembers.length;
      storeUsers(cachedMembers);
    },
    partitionKey: currentRoomId,
  });
};
