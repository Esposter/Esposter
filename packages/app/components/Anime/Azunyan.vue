<script setup lang="ts">
import { azunyanExpressions } from "@/services/anime/azunyanExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph
    id="azunyan"
    :expressions="azunyanExpressions"
    :bounds="{ top: 4, bottom: -5, left: -7, right: 7 }"
  />
</template>
