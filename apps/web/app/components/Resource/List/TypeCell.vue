<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

interface Props {
  type: ResourceType;
}

defineProps<Props>();
</script>

<template>
  <span flex gap-2 items-center>
    <span :class="ResourceDefinitionMap[type].icon" aria-hidden="true" size-5 />
    {{ ResourceDefinitionMap[type].title }}
  </span>
</template>
