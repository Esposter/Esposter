import { SettingsType } from "@/models/message/settings/SettingsType";

export const useSettingsStore = defineStore("message/settings", () => {
  const settingsType = ref(SettingsType.Webhook);
  return {
    settingsType,
  };
});
