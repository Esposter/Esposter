<script setup lang="ts">
import { NullStrategyItemCategoryDefinitions } from "@/services/resource/sheet/commands/NullStrategyItemCategoryDefinitions";

const nullStrategy = useNullStrategy();
</script>

<template>
  <StyledTooltipMenuIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    icon="mdi-null"
    text="Null Strategy"
  >
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of NullStrategyItemCategoryDefinitions"
        :key="value"
        :title
        @click="nullStrategy(value)"
      />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
