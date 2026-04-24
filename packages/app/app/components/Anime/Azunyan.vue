<script setup lang="ts">
import { AzunyanExpressions } from "@/services/anime/azunyanExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph id="azunyan" :expressions="AzunyanExpressions" />
</template>
