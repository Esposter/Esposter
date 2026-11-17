<!-- A settings list still on its way: three rows, each a mark and a line of text -->
<template>
  <div aria-busy="true" flex flex-col>
    <UiListRowSkeleton v-for="index of 3" :key="index" is-text-short />
  </div>
</template>
