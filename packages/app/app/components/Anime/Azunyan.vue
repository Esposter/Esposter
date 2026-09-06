<script setup lang="ts">
import { AzunyanExpressions } from "@/services/anime/AzunyanExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph id="azunyan" :expressions="AzunyanExpressions" />
</template>
