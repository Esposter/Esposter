import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const friends = ref<User[]>([]);

  const createFriend = (user: User) => {
    if (!friends.value.some(({ id }) => id === user.id)) friends.value = [user, ...friends.value];
  };

  const storeDeleteFriend = (friendId: string) => {
    friends.value = friends.value.filter(({ id }) => id !== friendId);
  };

  const deleteFriend = async (friendId: FriendUserIdInput) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    storeDeleteFriend(friendId);
  };

  return {
    createFriend,
    deleteFriend,
    friends,
    storeDeleteFriend,
  };
});
