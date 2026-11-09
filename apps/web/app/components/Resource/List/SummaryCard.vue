<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";

interface Props {
  count: number;
  type: ResourceType;
}

defineProps<Props>();
const emit = defineEmits<{ select: [type: ResourceType] }>();
</script>

<template>
  <button type="button" ui-card flex gap-3 w-full items-center @click="emit('select', type)">
    <span :class="ResourceDefinitionMap[type].icon" aria-hidden="true" text-accent shrink-0 size-6 />
    <span flex flex-col min-w-0>
      <span ui-title>{{ count }}</span>
      <span text-muted truncate>{{ ResourceDefinitionMap[type].title }} {{ pluralize("resource", count) }}</span>
    </span>
  </button>
</template>
