<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { mergeProps } from "vue";

interface Props {
  isPending?: boolean;
  // Its accessible name and its tooltip at once
  label: string;
  meaning: UiIconMeaning;
  variant?: UiButtonVariant;
}

// One control of a call, shared by every bar a call draws: the call view's, the room's call strip, the
// Picture-in-picture window's and the ready room's. A state that is off or stopping — muted, camera off, leaving — takes
// The danger variant, and one that is on — a raised hand, a screen being shared — the accent
defineOptions({ inheritAttrs: false });
const { isPending, label, meaning, variant } = defineProps<Props>();
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <UiButton :="mergeProps(activatorProps, $attrs)" :aria-label="label" :disabled="isPending" :variant px-0>
      <UiSpinner v-if="isPending" />
      <UiIcon v-else :meaning />
    </UiButton>
  </UiTooltip>
</template>
