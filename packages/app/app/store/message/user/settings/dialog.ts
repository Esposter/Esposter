import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const useUserSettingsDialogStore = defineStore("message/user/settings/dialog", () => {
  const isVisible = ref(false);
  // Mobile-only: the settings sidebar becomes a temporary drawer toggled from the content header
  const isDrawerOpen = ref(false);
  const settingsType = ref(UserSettingsType.Account);
  return { isDrawerOpen, isVisible, settingsType };
});
