<script setup lang="ts">
// Read-only reference for now; rebinding is a future enhancement (the PTT keybind is editable under Voice & Video).
const shortcuts = [
  { keys: "Ctrl + K", title: "Open command palette" },
  { keys: "↑", title: "Edit your last message" },
  { keys: "Esc", title: "Cancel editing / close" },
];
</script>

<template>
  <v-container fluid>
    <div font-bold mb-4 text-title-medium>Keybinds</div>
    <v-list>
      <v-list-item v-for="shortcut of shortcuts" :key="shortcut.title" :title="shortcut.title">
        <template #append>
          <kbd>{{ shortcut.keys }}</kbd>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>
