<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  column: Column;
}

const { column } = defineProps<Props>();
</script>

<template>
  <div flex gap-1 items-center :class="{ 'text-muted': column.isHidden }">
    {{ column.name }}
    <UiIcon v-if="column.isHidden" label="Hidden from the data" :meaning="UiIconMeaning.Hide" />
    <UiTooltip v-if="column.description" #default="{ activatorProps }" :label="column.description">
      <span :="activatorProps" tabindex="0" flex>
        <UiIcon label="Description" :meaning="UiIconMeaning.Info" />
      </span>
    </UiTooltip>
  </div>
</template>
