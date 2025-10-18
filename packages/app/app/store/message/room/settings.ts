import { SettingsType } from "@/models/message/settings/SettingsType";

export const useSettingsStore = defineStore("message/room/settings", () => {
  const dialog = ref(false);
  const settingsType = ref(SettingsType.Webhook);
  return {
    dialog,
    settingsType,
  };
});
