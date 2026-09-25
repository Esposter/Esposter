<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  title: string;
}

defineSlots<{ actions?: () => VNode }>();
const { title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<!-- The one header every pane draws, on every screen: a narrow screen's sheet hides its own title bar for it, so the
     pane is never titled and closable twice -->
<template>
  <header px-4 py-2 flex gap-2 ui-bar items-center>
    <h2 flex-1 truncate ui-heading>{{ title }}</h2>
    <slot name="actions" />
    <UiIconButton
      label="Close"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="emit('close')"
    />
  </header>
</template>
