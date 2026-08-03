<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { getResourceActivityDetail } from "@/services/resource/activity/getResourceActivityDetail";
import { ResourceActivityIconMap } from "@/services/resource/activity/ResourceActivityIconMap";
import { ResourceActivityTitleMap } from "@/services/resource/activity/ResourceActivityTitleMap";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { useAlertStore } from "@/store/alert";
import { useActivityStore } from "@/store/resource/activity";
import { getResultAsync, noop } from "@esposter/shared";

interface ResourceActivityLogProps {
  resourceId: Resource["id"];
}

const { resourceId } = defineProps<ResourceActivityLogProps>();
const { readActivities, readMoreActivities } = useReadActivities(resourceId);
const activityStore = useActivityStore();
const { hasMore, items } = storeToRefs(activityStore);
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const isLoading = ref(true);

onMounted(async () => {
  // A failed read still clears the skeleton — the empty state renders instead of loading forever
  await getResultAsync(readActivities).match(noop, (error) => {
    createAlert(error.message, "error");
  });
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
        <v-list-item
          v-for="activity of items"
          :key="activity.rowKey"
          :prepend-icon="ResourceActivityIconMap[activity.activityType]"
          :title="ResourceActivityTitleMap[activity.activityType]"
        >
          <template #subtitle>
            <span v-if="getResourceActivityDetail(activity)">{{ getResourceActivityDetail(activity) }} · </span>
            <span :title="dayjs(activity.createdAt).format(RESOURCE_DATE_FORMAT)">
              {{ dayjs(activity.createdAt).fromNow() }}
            </span>
          </template>
        </v-list-item>
      </v-list>
      <StyledWaypoint :is-active="hasMore" @change="readMoreActivities" />
    </v-card>
  </div>
</template>
