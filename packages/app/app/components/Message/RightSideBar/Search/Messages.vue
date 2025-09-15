<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { messages, page, pageCount } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="messages.length > 0">
    <v-list density="compact">
      <MessageContentSearchHistoryMessage v-for="message in messages" :key="message.rowKey" :message />
    </v-list>
    <div mt-2 flex justify-center>
      <v-pagination
        v-model="page"
        :length="pageCount"
        @update:model-value="readSearchedMessages(($event - 1) * DEFAULT_READ_LIMIT)"
      />
    </div>
  </template>
  <div v-else py-6 text-center text-gray>No results</div>
</template>
