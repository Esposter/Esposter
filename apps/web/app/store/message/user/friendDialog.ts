import type { User } from "@esposter/db-schema";

export const useFriendDialogStore = defineStore("message/user/friendDialog", () => {
  const removingUserId = ref<User["id"]>("");
  const unblockingUserId = ref<User["id"]>("");
  return { removingUserId, unblockingUserId };
});
