import { authClient } from "@/services/auth/authClient";
import { useFriendStore } from "@/store/message/user/friend";

export const useFriendSubscribables = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { storeAcceptFriendRequest, storeCreatePendingRequest, storeDeclineFriendRequest, storeDeleteFriend } =
    friendStore;

  useOnlineSubscribable(
    () => session.value.data?.user.id,
    (userId) => {
      if (!userId) return undefined;

      const sendFriendRequestUnsubscribable = $trpc.friend.onSendFriendRequest.subscribe(undefined, {
        onData: (senderUser) => {
          storeCreatePendingRequest(senderUser);
        },
      });
      const acceptFriendRequestUnsubscribable = $trpc.friend.onAcceptFriendRequest.subscribe(undefined, {
        onData: (receiverUser) => {
          storeAcceptFriendRequest(receiverUser);
        },
      });
      const declineFriendRequestUnsubscribable = $trpc.friend.onDeclineFriendRequest.subscribe(undefined, {
        onData: (declinerId) => {
          storeDeclineFriendRequest(declinerId);
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
