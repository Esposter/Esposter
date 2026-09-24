<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible, settingsType } = storeToRefs(userSettingsDialogStore);
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const { readUserSettings } = userSettingsStore;

watch(isVisible, async (newIsVisible) => {
  if (newIsVisible && !userSettings.value) await readUserSettings();
});
</script>

<template>
  <MessageModelSettingsDialog v-model="isVisible" title="User settings">
    <!-- The dialog is always in the document, so the panels mount only while it is open: the voice panel alone starts
         the microphone -->
    <template v-if="isVisible">
      <MessageModelUserSettingsLeftSideBar v-model="settingsType" />
      <MessageModelUserSettingsContent :settings-type />
    </template>
  </MessageModelSettingsDialog>
</template>
