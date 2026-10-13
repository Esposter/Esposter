import type { PublicUser } from "@esposter/db-schema";

export const useFriendDialogStore = defineStore("message/user/friendDialog", () => {
  const invitingUserId = ref<PublicUser["id"]>("");
  const removingUserId = ref<PublicUser["id"]>("");
  const unblockingUserId = ref<PublicUser["id"]>("");
  return { invitingUserId, removingUserId, unblockingUserId };
});
