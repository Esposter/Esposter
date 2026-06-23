<script setup lang="ts">
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";

// Read-only reference for now; rebinding is a future enhancement (the PTT keybind is editable under Voice & Video).
const shortcuts = [
  { keys: "Ctrl + K", title: "Open command palette" },
  { keys: "↑", title: "Edit your last message" },
  { keys: "Esc", title: "Cancel editing / close" },
];
</script>

<template>
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <v-list>
      <v-list-item v-for="{ keys, title } of shortcuts" :key="title" :title>
        <template #append>
          <kbd>{{ keys }}</kbd>
        </template>
      </v-list-item>
    </v-list>
  </MessageModelUserSettingsSection>
</template>
