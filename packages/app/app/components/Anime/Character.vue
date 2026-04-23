<script setup lang="ts">
import type { Expression } from "@/models/desmos/Expression";

interface CharacterProps {
  expressions: Expression[];
  id: string;
}

const { expressions, id } = defineProps<CharacterProps>();
</script>

<template>
  <VisualDesmosDisplayGraph :id="id" :expressions="expressions" />
</template>
