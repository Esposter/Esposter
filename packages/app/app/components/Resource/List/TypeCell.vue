<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

interface ResourceListTypeCellProps {
  type: ResourceType;
}

defineProps<ResourceListTypeCellProps>();
</script>

<template>
  <div flex gap-2 items-center>
    <v-icon :icon="ResourceDefinitionMap[type].icon" />
    {{ ResourceDefinitionMap[type].title }}
  </div>
</template>
