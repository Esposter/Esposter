<script setup lang="ts">
import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";
import type { UserSettingsType } from "@/models/message/user/UserSettingsType";

import { UserSettingsTypes } from "@/models/message/user/UserSettingsType";
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";
import { UserSettingsListItemMap } from "@/services/message/user/settings/UserSettingsListItemMap";
import { UserSettingsSectionMap } from "@/services/message/user/settings/UserSettingsSectionMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const modelValue = defineModel<UserSettingsType>({ required: true });
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isDrawerOpen } = storeToRefs(userSettingsDialogStore);
const typeItems = computed(() =>
  UserSettingsTypes.map((settingsType) => ({
    icon: UserSettingsListItemMap[settingsType].icon,
    isCurrent: settingsType === modelValue.value,
    title: settingsType,
    value: settingsType,
  })),
);
// Every visible section is marked, the same as the docs table of contents. The panel scrolls itself rather than with
// The page, so the scrollspy is bounded by that container
const visibleSectionIds = useVisibleSectionIds(() => UserSettingsSectionMap[modelValue.value], SETTINGS_CONTENT_ID);
// A panel of one section needs no way through it
const sectionItems = computed(() =>
  UserSettingsSectionMap[modelValue.value].length > 1
    ? UserSettingsSectionMap[modelValue.value].map((section) => ({
        icon: "i-mdi:pound",
        isCurrent: visibleSectionIds.value.includes(section),
        title: section,
        value: section,
      }))
    : [],
);
const scrollToSection = (section: SettingsSection) => {
  window.document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  // Close the narrow screen's sidebar once the section is on its way into view
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <nav aria-label="User settings" p-2 flex flex-col gap-3>
      <UiList
        :items="typeItems"
        label="Settings"
        @select="
          (settingsType) => {
            modelValue = settingsType;
            isDrawerOpen = false;
          }
        "
      />
      <section v-if="sectionItems.length > 0" flex flex-col gap-1>
        <h3 text-sm text-muted px-2>On this page</h3>
        <UiList :items="sectionItems" label="Sections" @select="(section) => scrollToSection(section)" />
      </section>
    </nav>
  </MessageModelSettingsLeftSideBar>
</template>
