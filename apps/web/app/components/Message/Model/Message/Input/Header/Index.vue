<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

defineSlots<{ default: () => VNode }>();
const emit = defineEmits<{ close: [] }>();
</script>

<!-- A line over the composer saying what the next message will be — a reply, a slash command — and the way out of it -->
<template>
  <div py-1 pl-3 pr-1 flex gap-2 items-center ui-frame>
    <div text-sm flex flex-1 gap-2 min-w-0 items-center>
      <slot />
    </div>
    <UiIconButton
      label="Close"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="emit('close')"
    />
  </div>
</template>
