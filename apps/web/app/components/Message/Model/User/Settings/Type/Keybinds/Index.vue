<script setup lang="ts">
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import { MessageInputCommands } from "@/services/message/input/MessageInputCommands";
</script>

<template>
  <!-- Read-only reference over the composer's keys, which the shortcuts dialog lists while the composer is mounted;
       rebinding is a future enhancement (the PTT keybind is editable under Voice & Video) -->
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <div flex flex-col gap-1>
      <div v-for="{ id, shortcut, title } of MessageInputCommands" :key="id" flex gap-2 items-center justify-between>
        {{ title }}
        <UiShortcut :shortcut />
      </div>
    </div>
  </MessageModelUserSettingsSection>
</template>
