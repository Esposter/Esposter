<script setup lang="ts">
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";

interface Props {
  counts: ResourceTypeCount[];
  error: string;
  isPending: boolean;
}

const { counts, error, isPending } = defineProps<Props>();
const emit = defineEmits<{ retry: []; select: [type: ResourceType] }>();
</script>

<template>
  <div p-4 flex-1 overflow-y-auto>
    <StyledSkeleton v-if="isPending" type="card@3" />
    <StyledErrorState v-else-if="error" :error @retry="emit('retry')" />
    <!-- The grouped count only returns types the filter actually matched, so an empty summary means an empty list -->
    <StyledEmptyState
      v-else-if="counts.length === 0"
      icon="mdi-folder-multiple-outline"
      title="Nothing to summarize"
      description="No resources match the current filters."
    />
    <v-row v-else dense>
      <v-col v-for="{ count, type } of counts" :key="type" cols="12" sm="6" md="4" lg="3">
        <!-- A card is the affordance for the type filter, so it navigates back into the list rather than anywhere new -->
        <v-card h-full @click="emit('select', type)">
          <v-card-text flex gap-4 items-center>
            <v-icon size="x-large" :icon="ResourceDefinitionMap[type].icon" />
            <div flex flex-col min-w-0>
              <span text-h5>{{ count }}</span>
              <span truncate op-medium-emphasis>
                {{ ResourceDefinitionMap[type].title }} {{ pluralize("resource", count) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
