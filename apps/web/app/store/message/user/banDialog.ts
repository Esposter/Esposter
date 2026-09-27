import type { BanInMessage } from "@esposter/db-schema";

export const useBanDialogStore = defineStore("message/user/banDialog", () => {
  const unbanningUserId = ref<BanInMessage["userId"]>("");
  return { unbanningUserId };
});
