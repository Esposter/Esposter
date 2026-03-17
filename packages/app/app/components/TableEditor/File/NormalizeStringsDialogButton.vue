<script setup lang="ts">
import { NormalizeStringModeItemCategoryDefinitions } from "@/services/tableEditor/file/NormalizeStringModeItemCategoryDefinitions";

const normalizeStrings = useNormalizeStrings();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Normalize Strings">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-format-letter-case" size="small" tile :="{ ...menuProps, ...tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of NormalizeStringModeItemCategoryDefinitions"
        :key="value"
        :title
        @click="normalizeStrings(value)"
      />
    </v-list>
  </v-menu>
</template>
