<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  source: string;
}

const { source } = defineProps<Props>();
const { copied, copy } = useClipboard({ legacy: true });
</script>

<template>
  <UiIconButton
    :label="copied ? 'Copied' : 'Copy'"
    :meaning="copied ? UiIconMeaning.Success : UiIconMeaning.Copy"
    @click="copy(source)"
  />
</template>
