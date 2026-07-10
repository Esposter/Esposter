<script setup lang="ts">
import type { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";

interface ResourceBladeTitleProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeTitleProps>();
const activeBladeTitle = computed(() =>
  ResourceBladeTypes.has(activeBlade as ResourceBladeType)
    ? ResourceBladeTitleMap[activeBlade as ResourceBladeType]
    : (ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.title ?? activeBlade),
);
</script>

<template>
  <div flex gap-3 items-center>
    <v-icon :icon="ResourceDefinitionMap[resource.type].icon" />
    <div flex flex-col>
      <span text-h6>{{ resource.name }} | {{ activeBladeTitle }}</span>
      <span text-caption op-medium-emphasis>{{ ResourceDefinitionMap[resource.type].title }}</span>
    </div>
  </div>
</template>
