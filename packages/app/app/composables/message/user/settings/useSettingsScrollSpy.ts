import { UserSettingsSectionMap } from "@/services/message/user/settings/UserSettingsSectionMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";
// Active section is the topmost visible one (each section reports its visibility in Section.vue), so it
// moves to the next section once the current one scrolls out of view. Sidebar clicks keep their value
// while the programmatic scroll runs via the guard.
export const useSettingsScrollSpy = () => {
  const userSettingsDialogStore = useUserSettingsDialogStore();
  const { activeSectionId, isScrollingToSection, settingsType, visibleSectionIds } =
    storeToRefs(userSettingsDialogStore);

  watch(visibleSectionIds, () => {
    if (isScrollingToSection.value) return;
    const activeSection = UserSettingsSectionMap[settingsType.value].find((section) =>
      visibleSectionIds.value.has(section),
    );
    if (activeSection) activeSectionId.value = activeSection;
  });
};
