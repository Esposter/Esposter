<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible, settingsType } = storeToRefs(userSettingsDialogStore);
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const { readUserSettings } = userSettingsStore;

watch(isVisible, async (isOpen) => {
  if (isOpen && !userSettings.value) await readUserSettings();
});
</script>

<template>
  <v-dialog v-model="isVisible" fullscreen>
    <v-app>
      <MessageModelUserSettingsLeftSideBar v-model="settingsType" />
      <MessageModelUserSettingsContent :settings-type />
    </v-app>
  </v-dialog>
</template>
