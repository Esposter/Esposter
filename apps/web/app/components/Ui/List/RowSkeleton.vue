<!-- A row still on its way: a mark and a line of text, in the shape a list's row takes whichever feature the list
     belongs to. A row whose line is a label beside a short value draws the line a third of the row wide -->
<script setup lang="ts">
interface Props {
  // The line is a third of the row rather than the rest of it, as a settings row's label is beside its value
  isTextShort?: true | undefined;
}

defineProps<Props>();
</script>

<template>
  <div ui-row>
    <UiSkeleton shrink-0 size-6 />
    <UiSkeleton v-if="isTextShort" h-4 w="1/3" />
    <UiSkeleton v-else flex-1 h-4 />
  </div>
</template>
