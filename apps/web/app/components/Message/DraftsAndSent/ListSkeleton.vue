<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
</script>

<!-- A page of rows in the timeline's own shape, its day heading, then the mark, the room, the text and the time -->
<template>
  <div aria-busy="true" flex flex-col>
    <UiSkeleton mb-2 h-4 w="1/6" />
    <div v-for="i in DEFAULT_READ_LIMIT" :key="i" ui-row>
      <UiSkeleton shrink-0 size-6 />
      <UiSkeleton h-4 w="1/4" />
      <UiSkeleton flex-1 h-4 />
      <UiSkeleton h-4 w-12 />
    </div>
  </div>
</template>
