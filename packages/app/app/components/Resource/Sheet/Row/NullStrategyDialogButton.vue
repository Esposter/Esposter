<script setup lang="ts">
import { NullStrategyItemCategoryDefinitions } from "@/services/resource/sheet/commands/NullStrategyItemCategoryDefinitions";

const nullStrategy = useNullStrategy();
</script>

<template>
  <ResourceSheetRowCommandMenuButton
    icon="mdi-null"
    :items="NullStrategyItemCategoryDefinitions"
    text="Null Strategy"
    @select="(value) => nullStrategy(value)"
  />
</template>
