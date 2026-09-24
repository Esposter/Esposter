<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
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

onMounted(async () => {
  // A failed read still clears the skeleton — the empty state renders instead of loading forever
  await getResultAsync(readActivities).match(noop, createErrorAlert);
  isLoading.value = false;
});
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <h2 ui-heading>Activity</h2>
    <div v-if="isLoading" flex flex-col gap-3>
      <div v-for="index of 5" :key="index" flex gap-3 items-center>
        <UiSkeleton shrink-0 size-6 />
        <div flex flex-1 flex-col gap-1>
          <UiSkeleton h-4 w="1/3" />
          <UiSkeleton h-3 w="1/4" />
        </div>
      </div>
    </div>
    <UiEmptyState
      v-else-if="items.length === 0"
      description="Changes to this resource will show up here."
      :meaning="UiIconMeaning.Recent"
      title="No activity yet"
    />
    <ul v-else flex flex-col gap-1>
      <ResourceActivityLogListItem v-for="activity of items" :key="activity.rowKey" :activity />
      <StyledWaypoint :is-active="hasMore" @change="readMoreActivities" />
    </ul>
  </div>
</template>
