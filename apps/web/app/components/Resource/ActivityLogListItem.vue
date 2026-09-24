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

<template>
  <li px-2 py-1 flex gap-3 items-center>
    <span :class="ResourceActivityDefinitionMap[activity.activityType].icon" aria-hidden="true" text-muted size-6 />
    <div flex flex-col min-w-0>
      <span>{{ ResourceActivityDefinitionMap[activity.activityType].title }}</span>
      <span text-muted>
        <template v-if="detail">{{ detail }} · </template>
        <NuxtTime :datetime="activity.createdAt" relative />
      </span>
    </div>
  </li>
</template>
