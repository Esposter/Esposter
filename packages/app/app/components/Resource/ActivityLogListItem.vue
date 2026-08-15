<script setup lang="ts">
import type { ResourceActivityEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { getResourceActivityDetail } from "@/services/resource/activity/getResourceActivityDetail";
import { ResourceActivityDefinitionMap } from "@/services/resource/activity/ResourceActivityDefinitionMap";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";

interface ResourceActivityLogListItemProps {
  activity: ResourceActivityEntity;
}

const { activity } = defineProps<ResourceActivityLogListItemProps>();
const detail = computed(() => getResourceActivityDetail(activity));
const displayCreatedAt = computed(() => dayjs(activity.createdAt).fromNow());
const displayCreatedAtExact = computed(() => dayjs(activity.createdAt).format(RESOURCE_DATE_FORMAT));
</script>

<template>
  <v-list-item
    :prepend-icon="ResourceActivityDefinitionMap[activity.activityType].icon"
    :title="ResourceActivityDefinitionMap[activity.activityType].title"
  >
    <template #subtitle>
      <span v-if="detail">{{ detail }} · </span>
      <span :title="displayCreatedAtExact">{{ displayCreatedAt }}</span>
    </template>
  </v-list-item>
</template>
