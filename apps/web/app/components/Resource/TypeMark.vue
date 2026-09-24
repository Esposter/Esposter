<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

interface Props {
  type: ResourceType;
}

const { type } = defineProps<Props>();
</script>

<!-- A resource type's mark in a field's block, the way an inventory holds an item in its slot -->
<template>
  <span p-2 flex shrink-0 ui-field>
    <span :class="ResourceDefinitionMap[type].icon" aria-hidden="true" size-6 />
  </span>
</template>
