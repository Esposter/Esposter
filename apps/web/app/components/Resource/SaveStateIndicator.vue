<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { ResourceSaveStateDefinitionMap } from "@/services/resource/ResourceSaveStateDefinitionMap";
import { useResourceStore } from "@/store/resource";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
// Narrow toolbars keep the icon and drop the words — the tooltip is what still spells the state out there
const { smAndDown } = useVDisplay();
const resourceStore = useResourceStore();
const { saveState } = storeToRefs(resourceStore);
// Widened off the as-const literal union so the two states carrying no colour read the optional key
const saveStateDefinition = computed<{ color?: string; icon: string; title: string }>(
  () => ResourceSaveStateDefinitionMap[saveState.value],
);
</script>

<template>
  <!-- Why there is no Save command anywhere: an edit is durable the moment this says so. The word alone would be
    a claim the owner has to take on trust, so the resting state names when — /docs/resource/resource-save-state -->
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltipActivatorProps }">
      <div :="tooltipActivatorProps" flex gap-1 items-center text-hint>
        <v-icon :color="saveStateDefinition.color" :icon="saveStateDefinition.icon" size="small" />
        <template v-if="!smAndDown">
          <span>{{ saveStateDefinition.title }}</span>
          <NuxtTime v-if="saveState === ResourceSaveState.Saved" :datetime="resource.updatedAt" relative />
        </template>
      </div>
    </template>
    <div flex gap-1 items-center>
      <span>{{ saveStateDefinition.title }}</span>
      <NuxtTime
        v-if="saveState === ResourceSaveState.Saved"
        :="RESOURCE_DATE_TIME_ATTRIBUTES"
        :datetime="resource.updatedAt"
      />
    </div>
  </v-tooltip>
</template>
