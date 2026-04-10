import { useBlockStore } from "@/store/message/user/block";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { useFriendStore } from "@/store/message/user/friend";

export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const blockStore = useBlockStore();
  const friendRequestStore = useFriendRequestStore();
  const friendStore = useFriendStore();
  const { blockedUsers } = storeToRefs(blockStore);
  const { friendRequests } = storeToRefs(friendRequestStore);
  const { friends } = storeToRefs(friendStore);

  const readFriends = async () => {
    const [readBlockedUsers, readFriends, readFriendRequests] = await Promise.all([
      $trpc.block.readBlockedUsers.query(),
      $trpc.friend.readFriends.query(),
      $trpc.friendRequest.readFriendRequests.query(),
    ]);
    blockedUsers.value = readBlockedUsers;
    friends.value = readFriends;
    friendRequests.value = readFriendRequests;
  };

  return { readFriends };
};
