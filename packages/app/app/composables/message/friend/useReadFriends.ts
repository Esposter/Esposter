import { useFriendStore } from "@/store/message/user/friend";

export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { blockedUsers, friends, pendingRequests, sentRequests } = storeToRefs(friendStore);

  const readFriends = async () => {
    const [readBlockedUsers, readFriends, readPendingRequests, readSentRequests] = await Promise.all([
      $trpc.friend.readBlockedUsers.query(),
      $trpc.friend.readFriends.query(),
      $trpc.friend.readPendingRequests.query(),
      $trpc.friend.readSentRequests.query(),
    ]);
    blockedUsers.value = readBlockedUsers;
    friends.value = readFriends;
    pendingRequests.value = readPendingRequests;
    sentRequests.value = readSentRequests;
  };

  return { readFriends };
};
