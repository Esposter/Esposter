<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

interface MessagesProps {
  messages: MessageEntity[];
  pageCount: number;
}

const { messages, pageCount } = defineProps<MessagesProps>();
const pageModelValue = defineModel<number>("page", { required: true });
</script>

<template>
  <template v-if="messages.length > 0">
    <v-list class="mt-2 border-sm">
      <v-list-item v-for="{ rowKey, message, createdAt } in messages" :key="rowKey">
        <v-list-item-title class="font-semibold">{{ message }}</v-list-item-title>
        <v-list-item-subtitle text-gray>{{ createdAt }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <div class="mt-2" flex justify-center>
      <v-pagination v-model="pageModelValue" :length="pageCount" />
    </div>
  </template>
  <div v-else py-6 text-center text-gray>No results</div>
</template>
