<script setup lang="ts">
import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";

const modelValue = defineModel<SettingsType>({ required: true });
const emit = defineEmits<{ "open:delete": [] }>();
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list pt-10>
      <MessageModelRoomSettingsLeftSideBarItem
        v-for="[settingsType, { color, icon }] of Object.entries(SettingsListItemMap)"
        :key="settingsType"
        :color
        :icon
        :is-active="settingsType === modelValue"
        :settings-type
        @click="
          (settingsType) => {
            if (settingsType === SettingsType.Delete) emit('open:delete');
            else modelValue.value = settingsType;
          }
        "
      />
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
