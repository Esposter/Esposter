<script setup lang="ts">
import { StringTransformationItemCategoryDefinitions } from "@/services/tableEditor/file/commands/StringTransformationItemCategoryDefinitions";

const stringTransformation = useStringTransformation();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="String Transformation">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-format-letter-case" size="small" tile :="{ ...menuProps, ...tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of StringTransformationItemCategoryDefinitions"
        :key="value"
        :title
        @click="stringTransformation(value)"
      />
    </v-list>
  </v-menu>
</template>
