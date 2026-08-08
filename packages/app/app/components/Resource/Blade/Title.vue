<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType, ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";

interface ResourceBladeTitleProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeTitleProps>();
// Overview is the resource itself rather than a face of it — naming it says nothing the name has not already
// Said, so only the blades that are somewhere else earn the suffix
const activeBladeTitle = computed(() => {
  if (activeBlade === ResourceBladeType.Overview) return "";
  else if (ResourceBladeTypes.has(activeBlade as ResourceBladeType))
    return ResourceBladeTitleMap[activeBlade as ResourceBladeType];
  return ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.title ?? activeBlade;
});
</script>

<template>
  <div flex gap-x-3 items-center>
    <v-icon :icon="ResourceDefinitionMap[resource.type].icon" />
    <div flex flex-col>
      <!-- The resource is what the page is about and the blade is which face of it is open, so only the name
           carries the weight — the same portal shape this explorer follows -->
      <span text-headline-small>
        <span font-bold>{{ resource.name }}</span>
        <template v-if="activeBladeTitle"> | {{ activeBladeTitle }}</template>
      </span>
      <span op-medium-emphasis text-body-small>{{ ResourceDefinitionMap[resource.type].title }}</span>
    </div>
  </div>
</template>
