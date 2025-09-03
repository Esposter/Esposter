<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useReadSearchedMessages } from "@/composables/message/useReadSearchedMessages";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { hasMore, messages } = storeToRefs(searchMessageStore);
const searchQuery = ref("");
const page = ref(1);
const pageCount = ref(1);
</script>

<template>
  <MessageContentSearchMenu :messages :has-more @select="createFilter">
    <template #activator="props">
      <MessageContentSearchInput
        v-model="searchQuery"
        :="props"
        @search="
          async (query) => {
            await readSearchedMessages({ query });
          }
        "
      />
    </template>
  </MessageContentSearchMenu>
  <MessageContentSearchMessages
    :page
    :messages
    :page-count
    @update:page="
      async (page) => {
        await readSearchedMessages({ offset: (page - 1) * DEFAULT_READ_LIMIT, query: searchQuery });
      }
    "
  />
</template>
