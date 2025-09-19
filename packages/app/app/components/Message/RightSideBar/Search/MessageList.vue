<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { items, page, pageCount } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="items.length > 0">
    <div flex-1 overflow-y-auto="!">
      <v-list>
        <MessageRightSideBarSearchMessage v-for="message in items" :key="message.rowKey" :message />
      </v-list>
      <div flex justify-center>
        <v-pagination
          v-model="page"
          w-full
          :length="pageCount"
          @update:model-value="readSearchedMessages(($event - 1) * DEFAULT_READ_LIMIT)"
        />
      </div>
    </div>
  </template>
  <div v-else pt-6 text-center text-gray>No results</div>
</template>
