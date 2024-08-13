<script setup lang="ts">
import { azunyanExpressions } from "@/services/anime/azunyanExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph id="azunyan" :expressions="azunyanExpressions" />
</template>
