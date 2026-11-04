<!-- A sidebar list still on its way: three bars in a column, standing in for the rows its first read has yet to bring -->
<template>
  <div flex flex-col gap-2>
    <UiSkeleton v-for="index of 3" :key="index" h-6 />
  </div>
</template>
