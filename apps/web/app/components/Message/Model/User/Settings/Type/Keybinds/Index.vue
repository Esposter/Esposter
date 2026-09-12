<script setup lang="ts">
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import { KEYBIND_SHORTCUTS } from "@/services/message/user/settings/constants";
</script>

<template>
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <v-list>
      <v-list-item v-for="{ keys, title } of KEYBIND_SHORTCUTS" :key="title" :title>
        <template #append>
          <kbd>{{ keys }}</kbd>
        </template>
      </v-list-item>
    </v-list>
  </MessageModelUserSettingsSection>
</template>
