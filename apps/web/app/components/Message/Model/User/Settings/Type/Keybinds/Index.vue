<script setup lang="ts">
import { KeybindsSettingsSection } from "#src/models/message/user/settings/KeybindsSettingsSection";
import { MessageInputCommands } from "#src/services/message/input/MessageInputCommands";
</script>

<template>
  <!-- Read-only reference over the composer's keys, which the shortcuts dialog lists while the composer is mounted;
       the keys are not rebound here (the PTT keybind is edited under Voice & Video) -->
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <ul flex flex-col>
      <li v-for="{ id, meaning, shortcut, title } of MessageInputCommands" :key="id" ui-row>
        <UiItemContent :meaning :shortcut :title />
      </li>
    </ul>
  </MessageModelUserSettingsSection>
</template>
