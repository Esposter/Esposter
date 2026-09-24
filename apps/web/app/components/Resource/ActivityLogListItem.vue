<script setup lang="ts">
import type { ResourceActivityEntity } from "@esposter/db-schema";

import { getResourceActivityDetail } from "@/services/resource/activity/getResourceActivityDetail";
import { ResourceActivityDefinitionMap } from "@/services/resource/activity/ResourceActivityDefinitionMap";

interface Props {
  activity: ResourceActivityEntity;
}

const { activity } = defineProps<Props>();
const detail = computed(() => getResourceActivityDetail(activity));
</script>

<!-- One change as one row: its mark, what happened and the detail after it, and when at the row's end. A log entry goes
     nowhere, so the row is read rather than pressed -->
<template>
  <li ui-row>
    <UiItemContent
      :description="detail"
      :icon="ResourceActivityDefinitionMap[activity.activityType].icon"
      :title="ResourceActivityDefinitionMap[activity.activityType].title"
    >
      <template #append>
        <NuxtTime :datetime="activity.createdAt" text-muted shrink-0 relative />
      </template>
    </UiItemContent>
  </li>
</template>
