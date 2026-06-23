import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

import { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";
import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const useUserSettingsDialogStore = defineStore("message/user/settings/dialog", () => {
  const isVisible = ref(false);
  const settingsType = ref(UserSettingsType.Voice);
  const activeSectionId = ref<SettingsSection>(VoiceSettingsSection.Devices);
  const isScrollingToSection = ref(false);
  const visibleSectionIds = ref(new Set<SettingsSection>());
  const setSectionVisibility = (section: SettingsSection, isSectionVisible: boolean) => {
    const next = new Set(visibleSectionIds.value);
    if (isSectionVisible) next.add(section);
    else next.delete(section);
    visibleSectionIds.value = next;
  };
  return { activeSectionId, isScrollingToSection, isVisible, setSectionVisibility, settingsType, visibleSectionIds };
});
