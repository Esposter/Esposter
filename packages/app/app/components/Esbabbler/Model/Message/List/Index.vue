<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMessageStore } from "@/store/esbabbler/message";
import { useElementVisibility } from "@vueuse/core";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, hasMoreNewer } = storeToRefs(messageStore);
const isLoading = ref(false);
const isLoadingNewer = ref(false);
const topSkeleton = useTemplateRef("topSkeleton");
const bottomSkeleton = useTemplateRef("bottomSkeleton");
const isTopVisible = useElementVisibility(topSkeleton);
const isBottomVisible = useElementVisibility(bottomSkeleton);

watchEffect(async () => {
  if (!isTopVisible.value || !hasMore.value || isLoading.value) return;
  isLoading.value = true;
  await readMoreMessages(() => (isLoading.value = false));
});

watchEffect(async () => {
  if (!isBottomVisible.value || !hasMoreNewer.value || isLoadingNewer.value) return;
  isLoadingNewer.value = true;
  await readMoreNewerMessages(() => (isLoadingNewer.value = false));
});
</script>

<template>
  <v-list flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <div v-if="hasMoreNewer" ref="bottomSkeleton">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
    <EsbabblerModelMessageListContainer />
    <div v-if="hasMore" ref="topSkeleton">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </div>
  </v-list>
</template>
