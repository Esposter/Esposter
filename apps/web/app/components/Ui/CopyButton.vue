<script setup lang="ts">
import type { UiButtonVariant } from "#src/models/ui/UiButtonVariant";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  // What it copies, as its name and tooltip say it: "Copy invite link"
  label?: string | undefined;
  source: string;
  variant?: UiButtonVariant | undefined;
}

const { label = "Copy" } = defineProps<Props>();
const { copied, copy } = useClipboard({ legacy: true });
</script>

<template>
  <UiIconButton
    :label="copied ? 'Copied' : label"
    :meaning="copied ? UiIconMeaning.Success : UiIconMeaning.Copy"
    :variant
    @click="copy(source)"
  />
</template>
