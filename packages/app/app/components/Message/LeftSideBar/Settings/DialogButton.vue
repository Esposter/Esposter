<script setup lang="ts">
import { UserSettingsType } from "@/models/message/user/UserSettingsType";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { DatabaseEntityType } from "@esposter/db-schema";
import { mergeProps } from "vue";

defineSlots<{ activator: (props: Record<string, unknown>) => VNode }>();
const dialog = ref(false);
const settingsType = ref(UserSettingsType.Account);
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const { readUserSettings } = userSettingsStore;
watch(dialog, async (isOpen) => {
  if (isOpen && !userSettings.value) await readUserSettings();
});
</script>

<template>
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip :text="`${DatabaseEntityType.User} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelUserSettingsLeftSideBar v-model="settingsType" />
      <MessageModelSettingsRightSideBar @close="dialog = false" />
      <MessageModelUserSettingsContent :settings-type />
    </v-app>
  </v-dialog>
</template>
