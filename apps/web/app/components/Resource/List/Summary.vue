<script setup lang="ts">
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceType } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_SUMMARY_SKELETON_COUNT } from "@/services/resource/constants";

interface Props {
  counts: ResourceTypeCount[];
  error: string;
  isPending: boolean;
}

const { counts, error, isPending } = defineProps<Props>();
const emit = defineEmits<{ retry: []; select: [type: ResourceType] }>();
</script>

<!-- How the filtered list breaks down by type: a card per type, its count over its name, a column at a time so a wide
     screen reads every type at a glance -->
<template>
  <div p-4 flex-1 of-y-auto>
    <UiErrorState v-if="error" :error @retry="emit('retry')" />
    <!-- Loading only while there is nothing to show: a filter change keeps the last read's cards while the next is out -->
    <div
      v-else-if="isPending && counts.length === 0"
      aria-busy="true"
      cols="[repeat(auto-fill,minmax(14rem,1fr))]"
      gap-3
      grid
    >
      <UiSkeleton v-for="index of RESOURCE_SUMMARY_SKELETON_COUNT" :key="index" h-18 />
    </div>
    <!-- The grouped count only returns types the filter actually matched, so an empty summary means an empty list -->
    <UiEmptyState
      v-else-if="counts.length === 0"
      description="No resources match the current filters."
      :meaning="UiIconMeaning.Summary"
      title="Nothing to summarize"
    />
    <!-- A card is the type filter's affordance, so it goes back into the list rather than anywhere new -->
    <ul v-else cols="[repeat(auto-fill,minmax(14rem,1fr))]" gap-3 grid>
      <li v-for="{ count, type } of counts" :key="type">
        <ResourceListSummaryCard :count :type @select="emit('select', $event)" />
      </li>
    </ul>
  </div>
</template>
