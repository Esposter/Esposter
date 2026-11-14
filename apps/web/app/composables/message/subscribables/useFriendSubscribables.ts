import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { useConnectionStore } from "@/store/realtime/connection";

// Of the two parties to a request or a friendship, the one that is not the person
const getOtherUserId = (userId: string | undefined, receiverId: string, senderId: string) =>
  senderId === userId ? receiverId : senderId;

export const useFriendSubscribables = async () => {
  const currentInstance = getCurrentInstance();
  const { data: session } = await useAuthSession();
  const friendRequestStore = useFriendRequestStore();
  const { storeAcceptFriendRequest, storeCreateFriendRequest, storeDeleteFriendRequestsByUser } = friendRequestStore;
  const friendStore = useFriendStore();
  const { storeDeleteFriend } = friendStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  const readFriendLists = useReadFriends();
  const unregisters = [
    onUserEvent("sendFriendRequest", (friendRequest) => {
      storeCreateFriendRequest(friendRequest);
    }),
    onUserEvent("acceptFriendRequest", ({ receiverUser, senderUser }) => {
      const friendUser = senderUser.id === session.value?.user.id ? receiverUser : senderUser;
      storeAcceptFriendRequest(friendUser);
    }),
    onUserEvent("declineFriendRequest", ({ receiverId, senderId }) => {
      const otherUserId = getOtherUserId(session.value?.user.id, receiverId, senderId);
      storeDeleteFriendRequestsByUser(otherUserId);
    }),
    onUserEvent("deleteFriend", ({ receiverId, senderId }) => {
      const otherUserId = getOtherUserId(session.value?.user.id, receiverId, senderId);
      storeDeleteFriend(otherUserId);
    }),
  ];
  // Torn down with the page that registered them, so a page mounted again does not hear each frame twice
  onUnmounted(() => {
    for (const unregister of unregisters) unregister();
  }, currentInstance);
  // The lists are read once the handlers are registered, so a change between the read and its registration
  // Is never lost. A component reading them on mount may read before this, and this read is issued after it
  await readFriendLists();
};
