import { useFriendStore } from "@/store/message/user/friend";

export const useFriendSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { storeAcceptFriendRequest, storeCreatePendingRequest, storeDeclineFriendRequest, storeDeleteFriend } =
    friendStore;

  $trpc.friend.onSendFriendRequest.subscribe(undefined, {
    onData: (senderUser) => {
      storeCreatePendingRequest(senderUser);
    },
  });

  $trpc.friend.onAcceptFriendRequest.subscribe(undefined, {
    onData: (acceptorUser) => {
      storeAcceptFriendRequest(acceptorUser);
    },
  });

  $trpc.friend.onDeclineFriendRequest.subscribe(undefined, {
    onData: (declinerId) => {
      storeDeclineFriendRequest(declinerId);
    },
  });

  $trpc.friend.onDeleteFriend.subscribe(undefined, {
    onData: (deleterId) => {
      storeDeleteFriend(deleterId);
    },
  });
};
