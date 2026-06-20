<script setup lang="ts">
import type { UserSettingsType } from "@/models/message/user/UserSettingsType";

import { UserSettingsListItemMap } from "@/services/message/user/settings/UserSettingsListItemMap";

const modelValue = defineModel<UserSettingsType>({ required: true });
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list pt-10>
      <MessageModelUserSettingsLeftSideBarItem
        v-for="[settingsType, { color, icon }] of Object.entries(UserSettingsListItemMap)"
        :key="settingsType"
        :color
        :icon
        :is-active="settingsType === modelValue"
        :settings-type="settingsType as UserSettingsType"
        @click="(settingsType) => (modelValue = settingsType)"
      />
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
