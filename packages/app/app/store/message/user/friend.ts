import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const friends = ref<User[]>([]);

  const deleteFriend = async (friendId: FriendUserIdInput) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    friends.value = friends.value.filter(({ id }) => id !== friendId);
  };

  const addFriend = (user: User) => {
    if (!friends.value.some(({ id }) => id === user.id)) friends.value = [user, ...friends.value];
  };

  const deleteFriend = (userId: string) => {
    friends.value = friends.value.filter(({ id }) => id !== userId);
  };

  return {
    addFriend,
    deleteFriend,
    deleteFriend,
    friends,
  };
});
