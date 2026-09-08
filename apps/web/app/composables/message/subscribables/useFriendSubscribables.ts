import { authClient } from "@/services/auth/authClient";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useFriendSubscribables = async () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
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

      return getUnsubscribe(
        $trpc.friendRequest.onSendFriendRequest.subscribe(undefined, {
          onData: (friendRequest) => {
            storeCreateFriendRequest(friendRequest);
          },
        }),
        $trpc.friendRequest.onAcceptFriendRequest.subscribe(undefined, {
          onData: (receiverUser) => {
            storeAcceptFriendRequest(receiverUser);
          },
        }),
        $trpc.friendRequest.onDeclineFriendRequest.subscribe(undefined, {
          onData: (declinerId) => {
            storeDeclineFriendRequest(declinerId);
          },
        }),
        $trpc.friend.onDeleteFriend.subscribe(undefined, {
          onData: (deleterId) => {
            storeDeleteFriend(deleterId);
          },
        }),
      );
    },
    onlineSubscribableContext,
  );
};
