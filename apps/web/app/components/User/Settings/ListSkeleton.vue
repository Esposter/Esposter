<!-- A settings list still on its way: three rows, each a mark and two lines of text -->
<template>
  <div aria-busy="true" flex flex-col gap-4>
    <div v-for="index of 3" :key="index" flex gap-4 items-center>
      <UiSkeleton shrink-0 size-12 />
      <div flex flex-1 flex-col gap-2>
        <UiSkeleton h-4 w="1/3" />
        <UiSkeleton h-4 w="2/3" />
      </div>
    </div>
  </div>
</template>
