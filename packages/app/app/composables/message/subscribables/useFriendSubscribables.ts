import { authClient } from "@/services/auth/authClient";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useFriendSubscribables = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const friendRequestStore = useFriendRequestStore();
  const friendStore = useFriendStore();
  const { storeDeleteFriend } = friendStore;
  const { storeAcceptFriendRequest, storeCreateFriendRequest, storeDeclineFriendRequest } = friendRequestStore;

  useOnlineSubscribable(
    () => session.value?.user.id,
    (userId) => {
      if (!userId) return undefined;

      const sendFriendRequestUnsubscribable = $trpc.friendRequest.onSendFriendRequest.subscribe(undefined, {
        onData: (friendRequest) => {
          storeCreateFriendRequest(friendRequest);
        },
      });
      const acceptFriendRequestUnsubscribable = $trpc.friendRequest.onAcceptFriendRequest.subscribe(undefined, {
        onData: (receiverUser) => {
          storeAcceptFriendRequest(receiverUser);
        },
      });
      const declineFriendRequestUnsubscribable = $trpc.friendRequest.onDeclineFriendRequest.subscribe(undefined, {
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
