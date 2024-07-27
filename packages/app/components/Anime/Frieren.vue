<script setup lang="ts">
import { frierenExpressions } from "@/services/anime/frierenExpressions";
</script>

<template>
  <VisualDesmosDisplayGraph id="frieren" :expressions="frierenExpressions" />
</template>
