import { useFriendStore } from "@/store/message/friend";

export const useReadFriends = () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();

  const readFriends = async () => {
    const [friendUsers, pendingUsers, sentUsers] = await Promise.all([
      $trpc.friend.readFriends.query(),
      $trpc.friend.readPendingRequests.query(),
      $trpc.friend.readSentRequests.query(),
    ]);
    friendStore.friends = friendUsers;
    friendStore.pendingRequests = pendingUsers;
    friendStore.sentRequests = sentUsers;
  };

  return { readFriends };
};
