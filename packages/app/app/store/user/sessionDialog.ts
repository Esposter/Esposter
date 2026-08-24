import type { SessionSummary } from "@@/server/models/session/SessionSummary";

export const useUserSessionDialogStore = defineStore("user/sessionDialog", () => {
  const revokingId = ref<SessionSummary["id"]>("");
  return {
    revokingId,
  };
});
