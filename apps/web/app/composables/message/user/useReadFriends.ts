import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const blockStore = useBlockStore();
  const { readBlockedUsers } = blockStore;
  const friendRequestStore = useFriendRequestStore();
  const { readFriendRequests } = friendRequestStore;
  const friendStore = useFriendStore();
  const { readFriends } = friendStore;

  return async () => {
    await Promise.all([
      readBlockedUsers(() => $trpc.block.readBlockedUsers.query()),
      readFriends(() => $trpc.friend.readFriends.query()),
      readFriendRequests(() => $trpc.friendRequest.readFriendRequests.query()),
    ]);
  };
};
