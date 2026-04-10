import { authClient } from "@/services/auth/authClient";

export const useFriendSubscribables = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const friendRequestStore = useFriendRequestStore();
  const { storeDeleteFriend } = friendStore;
  const { createFriendRequest, storeAcceptFriendRequest, storeDeleteSentFriendRequest } = friendRequestStore;

  useOnlineSubscribable(
    () => session.value.data?.user.id,
    (userId) => {
      if (!userId) return undefined;

      const sendFriendRequestUnsubscribable = $trpc.friendRequest.onSendFriendRequest.subscribe(undefined, {
        onData: (senderUser) => {
          createFriendRequest(senderUser);
        },
      });
      const acceptFriendRequestUnsubscribable = $trpc.friendRequest.onAcceptFriendRequest.subscribe(undefined, {
        onData: (receiverUser) => {
          storeAcceptFriendRequest(receiverUser);
        },
      });
      const declineFriendRequestUnsubscribable = $trpc.friendRequest.onDeclineFriendRequest.subscribe(undefined, {
        onData: (declinerId) => {
          storeDeleteSentFriendRequest({ id: declinerId });
        },
      });
      const deleteFriendUnsubscribable = $trpc.friend.onDeleteFriend.subscribe(undefined, {
        onData: (deleterId) => {
          storeDeleteFriend(deleterId);
        },
      });

      return () => {
        sendFriendRequestUnsubscribable.unsubscribe();
        acceptFriendRequestUnsubscribable.unsubscribe();
        declineFriendRequestUnsubscribable.unsubscribe();
        deleteFriendUnsubscribable.unsubscribe();
      };
    },
  );
};
