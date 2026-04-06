import { useFriendStore } from "@/store/message/user/friend";

export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { friends, pendingRequests, sentRequests } = storeToRefs(friendStore);

  const readFriends = async () => {
    const [readFriends, readPendingRequests, readSentRequests] = await Promise.all([
      $trpc.friend.readFriends.query(),
      $trpc.friend.readPendingRequests.query(),
      $trpc.friend.readSentRequests.query(),
    ]);
    friends.value = readFriends;
    pendingRequests.value = readPendingRequests;
    sentRequests.value = readSentRequests;
  };

  return { readFriends };
};
