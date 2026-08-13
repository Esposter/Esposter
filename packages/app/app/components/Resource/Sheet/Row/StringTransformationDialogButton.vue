<script setup lang="ts">
import { StringTransformationItemCategoryDefinitions } from "@/services/resource/sheet/commands/StringTransformationItemCategoryDefinitions";

const stringTransformation = useStringTransformation();
</script>

<template>
  <ResourceSheetRowCommandMenuButton
    icon="mdi-format-letter-case"
    :items="StringTransformationItemCategoryDefinitions"
    text="String Transformation"
    @select="(value) => stringTransformation(value)"
  />
</template>
