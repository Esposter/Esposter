import type { PublicUser } from "@esposter/db-schema";

export const useFriendDialogStore = defineStore("message/user/friendDialog", () => {
  const removingUserId = ref<PublicUser["id"]>("");
  const unblockingUserId = ref<PublicUser["id"]>("");
  return { removingUserId, unblockingUserId };
});
