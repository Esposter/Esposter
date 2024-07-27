<script setup lang="ts">
import { yuiExpressions } from "@/services/anime/yuiExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph
    id="yui"
    :expressions="yuiExpressions"
    :bounds="{ top: 5, bottom: -5, left: -7, right: 8 }"
  />
</template>
