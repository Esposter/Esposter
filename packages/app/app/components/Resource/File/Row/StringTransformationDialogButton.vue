<script setup lang="ts">
import { StringTransformationItemCategoryDefinitions } from "@/services/resource/file/commands/StringTransformationItemCategoryDefinitions";

const stringTransformation = useStringTransformation();
</script>

<template>
  <StyledTooltipMenuIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    icon="mdi-format-letter-case"
    text="String Transformation"
  >
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of StringTransformationItemCategoryDefinitions"
        :key="value"
        :title
        @click="stringTransformation(value)"
      />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
