<script setup lang="ts">
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import { MessageInputCommands } from "@/services/message/input/MessageInputCommands";
</script>

<template>
  <!-- Read-only reference over the composer's keys, which the shortcuts dialog lists while the composer is mounted;
       rebinding is a future enhancement (the PTT keybind is editable under Voice & Video) -->
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <ul flex flex-col>
      <li v-for="{ id, meaning, shortcut, title } of MessageInputCommands" :key="id" ui-row>
        <UiItemContent :meaning :shortcut :title />
      </li>
    </ul>
  </MessageModelUserSettingsSection>
</template>
