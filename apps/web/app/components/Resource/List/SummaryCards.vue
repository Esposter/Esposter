<script setup lang="ts">
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";
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

<template>
  <div p-4 flex-1 of-y-auto>
    <UiErrorState v-if="error" :error @retry="emit('retry')" />
    <!-- The grouped count only returns types the filter actually matched, so an empty summary means an empty list -->
    <UiEmptyState
      v-else-if="!isPending && counts.length === 0"
      description="No resources match the current filters."
      :meaning="UiIconMeaning.Summary"
      title="Nothing to summarize"
    />
    <div v-else grid="~ cols-[repeat(auto-fill,minmax(14rem,1fr))]" gap-3>
      <template v-if="isPending">
        <UiSkeleton v-for="index of RESOURCE_SUMMARY_SKELETON_COUNT" :key="index" h-20 />
      </template>
      <!-- A card is the type filter's affordance, so it goes back into the list rather than anywhere new -->
      <template v-else>
        <button
          v-for="{ count, type } of counts"
          :key="type"
          type="button"
          ui-button
          text-left
          @click="emit('select', type)"
        >
          <ResourceTypeMark :type />
          <span flex flex-col min-w-0>
            <span ui-title>{{ count }}</span>
            <span text-muted truncate>{{ ResourceDefinitionMap[type].title }} {{ pluralize("resource", count) }}</span>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>
