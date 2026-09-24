<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSearchMessageStore } from "@/store/message/search";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { items, page, pageCount } = storeToRefs(searchMessageStore);
// A page of results is read as the reader turns to it, from the offset where it starts
const turnPage = async (newPage: number) => {
  page.value = newPage;
  await readSearchedMessages((newPage - 1) * DEFAULT_READ_LIMIT);
};
</script>

<!-- Pages turned as a data table's are, from its foot: back, where the reader is, and on -->
<template>
  <MessageModelMessageSearchList :messages="items">
    <footer v-if="pageCount > 1" p-2 flex gap-2 w-full items-center justify-center>
      <UiIconButton
        :disabled="page <= 1"
        label="Previous page"
        :meaning="UiIconMeaning.Previous"
        :variant="UiButtonVariant.Quiet"
        @click="turnPage(page - 1)"
      />
      <span text-sm text-muted>Page {{ page }} of {{ pageCount }}</span>
      <UiIconButton
        :disabled="page >= pageCount"
        label="Next page"
        :meaning="UiIconMeaning.Next"
        :variant="UiButtonVariant.Quiet"
        @click="turnPage(page + 1)"
      />
    </footer>
  </MessageModelMessageSearchList>
</template>
