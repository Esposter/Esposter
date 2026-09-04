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
  <v-list-item
    :prepend-icon="ResourceActivityDefinitionMap[activity.activityType].icon"
    :title="ResourceActivityDefinitionMap[activity.activityType].title"
  >
    <template #subtitle>
      <span v-if="detail">{{ detail }} · </span>
      <NuxtTime :datetime="activity.createdAt" relative />
    </template>
  </v-list-item>
</template>
