<script setup lang="ts">
import type { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";

interface ResourceBladeTitleProps {
  activeBlade: ResourceBladeType;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeTitleProps>();
</script>

<template>
  <div flex gap-3 items-center>
    <v-icon :icon="ResourceDefinitionMap[resource.type].icon" />
    <div flex flex-col>
      <span text-h6>{{ resource.name }} | {{ ResourceBladeTitleMap[activeBlade] }}</span>
      <span text-caption op-medium-emphasis>{{ ResourceDefinitionMap[resource.type].title }}</span>
    </div>
  </div>
</template>
