<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { items, page, pageCount } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageModelMessageSearchList :messages="items">
    <div flex justify-center>
      <v-pagination
        v-model="page"
        w-full
        :length="pageCount"
        @update:model-value="readSearchedMessages(($event - 1) * DEFAULT_READ_LIMIT)"
      />
    </div>
  </MessageModelMessageSearchList>
</template>
