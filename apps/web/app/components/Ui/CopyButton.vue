<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // What it copies, as its name and tooltip say it: "Copy invite link"
  label?: string;
  source: string;
}

const { label = "Copy", source } = defineProps<Props>();
const { copied, copy } = useClipboard({ legacy: true });
</script>

<template>
  <UiIconButton
    :label="copied ? 'Copied' : label"
    :meaning="copied ? UiIconMeaning.Success : UiIconMeaning.Copy"
    @click="copy(source)"
  />
</template>
