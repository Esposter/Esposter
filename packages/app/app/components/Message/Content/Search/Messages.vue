<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { messages, page, pageCount } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="messages.length > 0">
    <v-list class="border-sm" mt-2>
      <v-list-item v-for="{ rowKey, message, createdAt } in messages" :key="rowKey">
        <v-list-item-title font-semibold>{{ message }}</v-list-item-title>
        <v-list-item-subtitle text-gray>{{ createdAt }}</v-list-item-subtitle>
      </v-list-item>
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
