<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

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
  <div p-6 flex flex-col gap-4>
    <span text-h6>Activity</span>
    <StyledSkeleton v-if="isLoading" type="list-item-two-line@5" />
    <StyledEmptyState
      v-else-if="items.length === 0"
      description="Changes to this resource will show up here."
      icon="mdi-history"
      title="No activity yet"
    />
    <v-card v-else>
      <v-list lines="two">
        <ResourceActivityLogListItem v-for="activity of items" :key="activity.rowKey" :activity />
      </v-list>
      <StyledWaypoint :is-active="hasMore" @change="readMoreActivities" />
    </v-card>
  </div>
</template>
