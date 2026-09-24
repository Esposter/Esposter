<!-- A settings list still on its way: three rows, each a mark and a line of text -->
<template>
  <div aria-busy="true" flex flex-col>
    <div v-for="index of 3" :key="index" ui-row>
      <UiSkeleton shrink-0 size-6 />
      <UiSkeleton h-4 w="1/3" />
    </div>
  </div>
</template>
