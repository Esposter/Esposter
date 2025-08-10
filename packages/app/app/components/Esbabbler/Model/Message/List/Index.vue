<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageScrollStore } from "@/store/esbabbler/messageScroll";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, hasMoreNewer, messages } = storeToRefs(messageStore);
const messageScrollStore = useMessageScrollStore();
const { messageContainer, messageContainerElement } = storeToRefs(messageScrollStore);
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
      if (!isBottomVisible.value || !messageContainerElement.value) return;
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
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
    <EsbabblerModelMessageListContainer />
    <div v-show="hasMore" ref="topSkeleton">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
  </v-list>
</template>
