import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

import { AccountSettingsSection } from "@/models/message/user/settings/AccountSettingsSection";
import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const useUserSettingsDialogStore = defineStore("message/user/settings/dialog", () => {
  const isVisible = ref(false);
  // Mobile-only: the settings sidebar becomes a temporary drawer toggled from the content header
  const isDrawerOpen = ref(false);
  const settingsType = ref(UserSettingsType.Account);
  const activeSectionId = ref<SettingsSection>(AccountSettingsSection.Profile);
  const isScrollingToSection = ref(false);
  const visibleSectionIds = ref(new Set<SettingsSection>());
  // Reassigned rather than mutated in place, unlike every other reactive collection here: the scrollspy watches
  // This ref without `deep`, so it tracks the ref's own dependency and never the Set's — an in-place add or
  // Delete would leave the active section pinned to whatever was visible when the dialog opened
  const setSectionVisibility = (section: SettingsSection, isSectionVisible: boolean) => {
    const newVisibleSectionIds = new Set(visibleSectionIds.value);
    if (isSectionVisible) newVisibleSectionIds.add(section);
    else newVisibleSectionIds.delete(section);
    visibleSectionIds.value = newVisibleSectionIds;
  };
  return {
    activeSectionId,
    isDrawerOpen,
    isScrollingToSection,
    isVisible,
    setSectionVisibility,
    settingsType,
    visibleSectionIds,
  };
});
