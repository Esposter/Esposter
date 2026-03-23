<script setup lang="ts">
import { NullStrategyItemCategoryDefinitions } from "@/services/tableEditor/file/commands/NullStrategyItemCategoryDefinitions";

const nullStrategy = useNullStrategy();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Null Strategy">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-null" size="small" tile :="{ ...menuProps, ...tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of NullStrategyItemCategoryDefinitions"
        :key="value"
        :title="title"
        @click="nullStrategy(value)"
      />
    </v-list>
  </v-menu>
</template>
