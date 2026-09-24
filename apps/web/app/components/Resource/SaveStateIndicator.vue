<script setup lang="ts">
import type { ResourceSaveStateDefinition } from "@/models/resource/ResourceSaveStateDefinition";
import type { Resource } from "@esposter/db-schema";

import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { ResourceSaveStateDefinitionMap } from "@/services/resource/ResourceSaveStateDefinitionMap";
import { useResourceStore } from "@/store/resource";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const resourceStore = useResourceStore();
const { saveState } = storeToRefs(resourceStore);
// Widened off the as-const literal union so the two states carrying no colour read the optional key
const saveStateDefinition = computed<ResourceSaveStateDefinition>(
  () => ResourceSaveStateDefinitionMap[saveState.value],
);
</script>

<template>
  <!-- Why there is no Save command anywhere: an edit is durable the moment this says so. The word alone would be
    a claim the owner has to take on trust, so the resting state names when — /docs/resource/resource-save-state.
    A narrow row keeps the mark and drops the words, which the tooltip still spells out -->
  <UiTooltip :label="saveStateDefinition.title">
    <template #content>
      {{ saveStateDefinition.title }}
      <NuxtTime
        v-if="saveState === ResourceSaveState.Saved"
        :="RESOURCE_DATE_TIME_ATTRIBUTES"
        :datetime="resource.updatedAt"
      />
    </template>
    <template #default="{ activatorProps }">
      <div :="activatorProps" role="status" text-muted flex gap-1 items-center tabindex="0">
        <UiIcon :class="saveStateDefinition.colorClass" :meaning="saveStateDefinition.meaning" />
        <!-- Still read out where it is not drawn, since the status announces each change -->
        <span sr-only md:not-sr-only>{{ saveStateDefinition.title }}</span>
        <NuxtTime
          v-if="saveState === ResourceSaveState.Saved"
          :datetime="resource.updatedAt"
          hidden
          relative
          md:inline
        />
      </div>
    </template>
  </UiTooltip>
</template>
