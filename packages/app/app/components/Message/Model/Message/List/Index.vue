<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useDataStore } from "@/store/message/data";
import { useScrollStore } from "@/store/message/scroll";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const dataStore = useDataStore();
const { hasMore, hasMoreNewer } = storeToRefs(dataStore);
const scrollStore = useScrollStore();
const { isScrolling, messageContainer, messageContainerElement } = storeToRefs(scrollStore);
const isLoading = ref(false);
const isLoadingNewer = ref(false);
const topSkeleton = useTemplateRef("topSkeleton");
const bottomSkeleton = useTemplateRef("bottomSkeleton");
const isTopVisible = useElementVisibility(topSkeleton);
const isBottomVisible = useElementVisibility(bottomSkeleton);
const previousScrollHeight = ref(0);

watchEffect(async () => {
  if (!isTopVisible.value || !hasMore.value || isLoading.value) return;
  isLoading.value = true;
  await readMoreMessages(() => {
    isLoading.value = false;
  });
});

watchEffect(async () => {
  if (!isBottomVisible.value || !hasMoreNewer.value || isLoadingNewer.value) return;
  isLoadingNewer.value = true;
  await readMoreNewerMessages(() => {
    isLoadingNewer.value = false;
    requestAnimationFrame(() => {
      if (isScrolling.value || !isBottomVisible.value || !messageContainerElement.value) return;
      messageContainerElement.value.scrollTop -=
        messageContainerElement.value.scrollHeight - previousScrollHeight.value;
      previousScrollHeight.value = messageContainerElement.value.scrollHeight;
    });
  });
});

watchOnce(messageContainerElement, (newMessageContainerElement) => {
  if (!newMessageContainerElement) return;
  previousScrollHeight.value = newMessageContainerElement.scrollHeight;
});
</script>

<template>
  <v-list ref="messageContainer" flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <div v-show="hasMoreNewer" ref="bottomSkeleton">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
    <MessageModelMessageListContainer />
    <div v-show="hasMore" ref="topSkeleton">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
  </v-list>
</template>
