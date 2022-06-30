<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-text-field
    placeholder="Aa"
    density="compact"
    clearable
    hide-details
    :model-value="roomStore.messageInput"
    @update:model-value="(val) => roomStore.updateMessageInput(val)"
    @keypress="
      (e) => {
        if (e.key === 'Enter') roomStore.sendMessage();
      }
    "
  >
    <template #clear>
      <v-btn
        class="bg-transparent"
        icon="mdi-close-circle"
        size="small"
        flat
        @click="roomStore.updateMessageInput('')"
      />
    </template>
    <template #appendInner>
      <v-btn class="bg-transparent" icon="mdi-emoticon" size="small" flat />
      <v-btn
        class="bg-transparent"
        size="small"
        flat
        :icon="roomStore.messageInput ? 'mdi-send' : 'mdi-microphone'"
        @click="roomStore.sendMessage"
      />
    </template>
  </v-text-field>
</template>
