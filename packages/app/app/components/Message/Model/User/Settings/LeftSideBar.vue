<script setup lang="ts">
import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";
import type { UserSettingsType } from "@/models/message/user/UserSettingsType";

import { UserSettingsTypes } from "@/models/message/user/UserSettingsType";
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";
import { UserSettingsListItemMap } from "@/services/message/user/settings/UserSettingsListItemMap";
import { UserSettingsSectionMap } from "@/services/message/user/settings/UserSettingsSectionMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";
import { withFinalizerAsync } from "@esposter/shared";

const modelValue = defineModel<UserSettingsType>({ required: true });
const userSettingsDialogStore = useUserSettingsDialogStore();
const { activeSectionId, isDrawerOpen, isScrollingToSection, visibleSectionIds } = storeToRefs(userSettingsDialogStore);
const onSelectType = (settingsType: UserSettingsType) => {
  modelValue.value = settingsType;
  // Close the mobile drawer after a selection (no-op on desktop where the drawer is permanent)
  isDrawerOpen.value = false;
};
const goTo = useVGoTo();
// Highlight every visible section (docs table-of-contents behaviour) — the slide indicator stretches
// Across them. While a sidebar click scrolls programmatically, pin the highlight to the target.
const activeSectionIds = computed<string[]>(() => {
  if (isScrollingToSection.value) return [activeSectionId.value];
  const sections = UserSettingsSectionMap[modelValue.value].filter((section) => visibleSectionIds.value.has(section));
  return sections.length > 0 ? sections : [activeSectionId.value];
});
const scrollToSection = async (section: SettingsSection) => {
  activeSectionId.value = section;
  const element = window.document.getElementById(section);
  if (!element) return;
  isScrollingToSection.value = true;
  await withFinalizerAsync(
    () => goTo(element, { container: `#${SETTINGS_CONTENT_ID}` }),
    () => {
      isScrollingToSection.value = false;
    },
  );
  // Close the mobile drawer once the section is in view (no-op on desktop where the drawer is permanent)
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <v-list :opened="[modelValue]">
      <v-list-group v-for="settingsType of UserSettingsTypes" :key="settingsType" :value="settingsType">
        <template #activator="{ props }">
          <v-list-item :="props" :active="settingsType === modelValue" @click="onSelectType(settingsType)">
            <template #prepend>
              <v-icon :icon="UserSettingsListItemMap[settingsType].icon" />
            </template>
            <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
          </v-list-item>
        </template>
        <StyledSlideIndicator v-if="settingsType === modelValue" :active-keys="activeSectionIds" />
        <v-list-item
          v-for="section of UserSettingsSectionMap[settingsType]"
          :key="section"
          :active="activeSectionIds.includes(section)"
          :data-slide-indicator-key="section"
          density="compact"
          @click="scrollToSection(section)"
        >
          <v-list-item-title :class="activeSectionIds.includes(section) ? 'font-bold' : 'op-60'">{{
            section
          }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
