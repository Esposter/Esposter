<script setup lang="ts">
import { AzunyanExpressions } from "@/services/anime/azunyanExpressions";
</script>

<template>
  <AnimeCharacter id="azunyan" :expressions="AzunyanExpressions" />
</template>
