<script setup lang="ts">
import { frierenExpressions } from "@/services/anime/frierenExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph
    id="frieren"
    :expressions="frierenExpressions"
    :bounds="{ top: 5, bottom: -5, left: -7, right: 9 }"
  />
</template>
