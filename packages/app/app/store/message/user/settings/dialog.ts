import { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";
import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const useUserSettingsDialogStore = defineStore("message/user/settings/dialog", () => {
  const isVisible = ref(false);
  const settingsType = ref(UserSettingsType.Voice);
  const activeSectionId = ref(VoiceSettingsSection.InputMode);
  const isScrollingToSection = ref(false);
  return { activeSectionId, isScrollingToSection, isVisible, settingsType };
});
