<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { UiIconMap } from "@/services/ui/UiIconMap";

interface Props {
  // The accessible name, for an icon that carries meaning its surroundings do not say; without one it is decoration
  label?: string;
  meaning: UiIconMeaning;
}

const { label, meaning } = defineProps<Props>();
const uiStyle = useUiStyle();
</script>

<template>
  <span
    :class="UiIconMap[uiStyle][meaning]"
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    align-middle
    shrink-0
    size-6
    inline-block
  />
</template>
