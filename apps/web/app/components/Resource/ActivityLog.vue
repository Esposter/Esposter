<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useActivityStore } from "@/store/resource/activity";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  resourceId: Resource["id"];
}

const { resourceId } = defineProps<Props>();
const { readActivities, readMoreActivities } = useReadActivities(resourceId);
const activityStore = useActivityStore();
const { hasMore, items } = storeToRefs(activityStore);
const isLoading = ref(true);
const error = ref("");
// A failed read clears the skeleton for the error state and its retry, never for an empty state it has not earned
const readFirstActivities = async () => {
  isLoading.value = true;
  error.value = "";
  await getResultAsync(readActivities).match(noop, (readError) => {
    error.value = readError.message;
  });
  isLoading.value = false;
};

onMounted(async () => {
  await readFirstActivities();
});
</script>

<!-- The tab already names the blade, so the log starts with its rows rather than a heading saying Activity again -->
<template>
  <div p-4 flex flex-col ui-body>
    <div v-if="isLoading" aria-busy="true" flex flex-col gap-1>
      <UiSkeleton v-for="index of 5" :key="index" h-8 />
    </div>
    <UiErrorState v-else-if="error" :error @retry="readFirstActivities()" />
    <UiEmptyState
      v-else-if="items.length === 0"
      description="Changes to this resource will show up here."
      :meaning="UiIconMeaning.Recent"
      title="No activity yet"
    />
    <ul v-else flex flex-col>
      <ResourceActivityLogListItem v-for="activity of items" :key="activity.rowKey" :activity />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreActivities(onComplete)" />
    </ul>
  </div>
</template>
