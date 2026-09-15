<script setup lang="ts">
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import { KeyboardShortcutList } from "@/services/message/input/KeyboardShortcutList";
</script>

<template>
  <!-- Read-only reference over the one shortcut list the Shift+? dialog renders; rebinding is a future
       enhancement (the PTT keybind is editable under Voice & Video) -->
  <MessageModelUserSettingsSection :title="KeybindsSettingsSection.Shortcuts">
    <v-list>
      <template v-for="{ category, items } of KeyboardShortcutList" :key="category">
        <v-list-subheader>{{ category }}</v-list-subheader>
        <v-list-item v-for="{ description, keys } of items" :key="description" :title="description">
          <template #append>
            <kbd>{{ keys.join(" + ") }}</kbd>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </MessageModelUserSettingsSection>
</template>
