<script setup lang="ts">
import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";
import type { UserSettingsType } from "@/models/message/user/UserSettingsType";

import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";
import { UserSettingsListItemMap } from "@/services/message/user/settings/UserSettingsListItemMap";
import { UserSettingsSectionMap } from "@/services/message/user/settings/UserSettingsSectionMap";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";
import { withFinalizerAsync } from "@esposter/shared";

const modelValue = defineModel<UserSettingsType>({ required: true });
const userSettingsDialogStore = useUserSettingsDialogStore();
const { activeSectionId, isScrollingToSection } = storeToRefs(userSettingsDialogStore);
const goTo = useVGoTo();
const scrollToSection = async (section: SettingsSection) => {
  activeSectionId.value = section;
  const element = document.getElementById(section);
  if (!element) return;
  isScrollingToSection.value = true;
  await withFinalizerAsync(
    () => goTo(element, { container: `#${SETTINGS_CONTENT_ID}` }),
    () => {
      isScrollingToSection.value = false;
    },
  );
};
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list :opened="[modelValue]">
      <v-list-group
        v-for="[settingsType, { icon }] of Object.entries(UserSettingsListItemMap)"
        :key="settingsType"
        :value="settingsType"
      >
        <template #activator="{ props }">
          <v-list-item
            :="props"
            :active="settingsType === modelValue"
            @click="modelValue = settingsType as UserSettingsType"
          >
            <template #prepend>
              <v-icon :icon />
            </template>
            <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
          </v-list-item>
        </template>
        <StyledSlideIndicator v-if="settingsType === modelValue" :active-key="activeSectionId" />
        <v-list-item
          v-for="section of UserSettingsSectionMap[settingsType as UserSettingsType]"
          :key="section"
          :active="activeSectionId === section"
          :data-slide-indicator-key="section"
          density="compact"
          @click="scrollToSection(section)"
        >
          <v-list-item-title :class="activeSectionId === section ? 'font-bold' : 'op-60'">{{
            section
          }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>

<style scoped>
/* Positioning context for the StyledSlideIndicator rail. */
:deep(.v-list-group__items) {
  position: relative;
}
</style>
