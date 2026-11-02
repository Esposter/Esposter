import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { subscribeStarted } from "@/services/shared/subscribeStarted";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useFriendSubscribables = async () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { data: session } = await useAuthSession();
  const { $trpc } = useNuxtApp();
  const friendRequestStore = useFriendRequestStore();
  const { storeAcceptFriendRequest, storeCreateFriendRequest, storeDeleteFriendRequestsByUser } = friendRequestStore;
  const friendStore = useFriendStore();
  const { storeDeleteFriend } = friendStore;
  const readFriendLists = useReadFriends();

  useOnlineSubscribable(
    () => session.value?.user.id,
    async (userId) => {
      if (!userId) return undefined;

      // The lists are read once these have started, so a change between the read and its subscription is never lost.
      // The components that read the lists on mount may read before this runs. This read is issued after theirs, so the
      // Lists keep its answer
      const subscriptions = await Promise.all([
        subscribeStarted((handlers) =>
          $trpc.friendRequest.onSendFriendRequest.subscribe(undefined, {
            onData: (friendRequest) => {
              storeCreateFriendRequest(friendRequest);
            },
            ...handlers,
          }),
        ),
        subscribeStarted((handlers) =>
          $trpc.friendRequest.onAcceptFriendRequest.subscribe(undefined, {
            onData: (receiverUser) => {
              storeAcceptFriendRequest(receiverUser);
            },
            ...handlers,
          }),
        ),
        subscribeStarted((handlers) =>
          $trpc.friendRequest.onDeclineFriendRequest.subscribe(undefined, {
            onData: (declinerId) => {
              storeDeleteFriendRequestsByUser(declinerId);
            },
            ...handlers,
          }),
        ),
        subscribeStarted((handlers) =>
          $trpc.friend.onDeleteFriend.subscribe(undefined, {
            onData: (deleterId) => {
              storeDeleteFriend(deleterId);
            },
            ...handlers,
          }),
        ),
      ]);
      await readFriendLists();
      return getUnsubscribe(...subscriptions);
    },
    onlineSubscribableContext,
  );
};
