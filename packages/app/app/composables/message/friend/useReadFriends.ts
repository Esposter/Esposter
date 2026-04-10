export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const friendRequestStore = useFriendRequestStore();
  const { blockedUsers, friends } = storeToRefs(friendStore);
  const { pendingRequests, sentRequests } = storeToRefs(friendRequestStore);

  const readFriends = async () => {
    const [readBlockedUsers, readFriends, readPendingRequests, readSentRequests] = await Promise.all([
      $trpc.friend.readBlockedUsers.query(),
      $trpc.friend.readFriends.query(),
      $trpc.friendRequest.readPendingRequests.query(),
      $trpc.friendRequest.readSentRequests.query(),
    ]);
    blockedUsers.value = readBlockedUsers;
    friends.value = readFriends;
    pendingRequests.value = readPendingRequests;
    sentRequests.value = readSentRequests;
  };

  return { readFriends };
};
