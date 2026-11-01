<!-- Friend rows still on their way: a few rows, each a mark and a line of text, in a friend row's own shape -->
<template>
  <ul aria-busy="true" flex flex-col>
    <li v-for="i in 3" :key="i" ui-row>
      <UiSkeleton shrink-0 size-6 />
      <UiSkeleton flex-1 h-4 />
    </li>
  </ul>
</template>
