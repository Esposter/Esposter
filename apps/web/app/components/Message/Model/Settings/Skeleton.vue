<!-- A settings panel still on its way, in a section's own shape: a heading over a few rows -->
<template>
  <div aria-busy="true" flex flex-col gap-3>
    <UiSkeleton h-6 w="1/4" />
    <div v-for="index of 4" :key="index" ui-row>
      <UiSkeleton shrink-0 size-6 />
      <UiSkeleton h-4 w="1/3" />
    </div>
  </div>
</template>
