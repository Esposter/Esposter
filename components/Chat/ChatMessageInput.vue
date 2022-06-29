<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
const sendMessage = () => roomStore.updateMessage("");
</script>

<template>
  <v-text-field
    placeholder="Aa"
    density="compact"
    clearable
    hide-details
    :model-value="roomStore.message"
    @update:model-value="(val) => roomStore.updateMessage(val)"
    @keypress="
      (e) => {
        if (e.key === 'Enter') sendMessage();
      }
    "
  >
    <template #clear>
      <v-btn class="bg-transparent" icon="mdi-close-circle" size="small" flat @click="roomStore.updateMessage('')" />
    </template>
    <template #appendInner>
      <v-btn class="bg-transparent" icon="mdi-emoticon" size="small" flat />
      <v-btn
        class="bg-transparent"
        size="small"
        flat
        :icon="roomStore.message ? 'mdi-send' : 'mdi-microphone'"
        @click="sendMessage"
      />
    </template>
  </v-text-field>
</template>
