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
const onSelectType = (settingsType: UserSettingsType) => {
  modelValue.value = settingsType;
  isDrawerOpen.value = false;
};
const goTo = useVGoTo();
const openedTypes = computed(() => [modelValue.value]);
// Every visible section is highlighted and the rail stretches across them, the same as the docs table of contents.
// The panel scrolls itself rather than with the page, so the scrollspy is bounded by that container
const visibleSectionIds = useVisibleSectionIds(() => UserSettingsSectionMap[modelValue.value], SETTINGS_CONTENT_ID);
const scrollToSection = async (section: SettingsSection) => {
  const element = window.document.getElementById(section);
  if (!element) return;

  await goTo(element, { container: `#${SETTINGS_CONTENT_ID}` });
  // Close the mobile drawer once the section is in view (no-op on desktop where the drawer is permanent)
  isDrawerOpen.value = false;
};
</script>

<template>
  <MessageModelSettingsLeftSideBar v-model:open="isDrawerOpen">
    <v-list :opened="openedTypes">
      <StyledSlideIndicator :active-keys="visibleSectionIds" />
      <v-list-group v-for="settingsType of UserSettingsTypes" :key="settingsType" :value="settingsType">
        <template #activator="{ props }">
          <v-list-item :="props" :active="settingsType === modelValue" @click="onSelectType(settingsType)">
            <template #prepend>
              <v-icon :icon="UserSettingsListItemMap[settingsType].icon" />
            </template>
            <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item
          v-for="section of UserSettingsSectionMap[settingsType]"
          :key="section"
          :active="visibleSectionIds.includes(section)"
          :data-slide-indicator-key="section"
          density="compact"
          @click="scrollToSection(section)"
        >
          <v-list-item-title :class="visibleSectionIds.includes(section) ? 'font-bold' : 'op-medium-emphasis'">{{
            section
          }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
