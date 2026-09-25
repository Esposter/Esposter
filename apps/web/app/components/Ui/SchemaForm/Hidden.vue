<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

interface Props extends UiSchemaFormRendererProps {}

// A field whose value the schema fixes — a variant's discriminant, which the variant choice sets — has nothing to edit,
// So it draws nothing, though JSON Forms' dispatch still hands it every renderer's props
defineProps<Props>();
</script>

<template>
  <span hidden />
</template>
