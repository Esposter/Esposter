<!-- Friend rows still on their way: a few rows, each a mark and a line of text, in a friend row's own shape -->
<template>
  <ul aria-busy="true" flex flex-col>
    <li v-for="i in 3" :key="i">
      <UiListRowSkeleton />
    </li>
  </ul>
</template>
