<script setup lang="ts">
import { yuiExpressions } from "@/services/anime/yuiExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph id="yui" :expressions="yuiExpressions" />
</template>
