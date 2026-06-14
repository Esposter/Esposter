<script setup lang="ts">
interface CallActionButtonProps {
  color?: string;
  icon: string;
  tooltip: string;
  variant: "plain" | "tonal";
}

const { color, icon, tooltip, variant } = defineProps<CallActionButtonProps>();
const emit = defineEmits<{ click: [] }>();
const wrapper = useTemplateRef("wrapper");
// Vuetify positions the tooltip against the main window, so inside a Document PiP window attach it
// to this wrapper and let the .call-pip-tooltip-wrapper overrides anchor it to the button via CSS.
const attach = ref<HTMLElement>();

onMounted(() => {
  if (wrapper.value && wrapper.value.ownerDocument !== document) attach.value = wrapper.value;
});
</script>

<template>
  <div ref="wrapper" relative flex class="call-pip-tooltip-wrapper">
    <v-tooltip :text="tooltip" location="top" :attach>
      <template #activator="{ props }">
        <v-btn :="props" :icon :color size="default" :variant :ripple="false" @click="emit('click')" />
      </template>
    </v-tooltip>
  </div>
</template>

<style>
/* When attached to the wrapper (PiP window only — otherwise the overlay teleports out and these
   selectors do not match), anchor the tooltip to the button instead of Vuetify's main-window coords. */
.call-pip-tooltip-wrapper .v-overlay {
  position: absolute !important;
  inset: 0 !important;
}
.call-pip-tooltip-wrapper .v-overlay__content {
  position: absolute !important;
  inset: auto auto calc(100% + 4px) 50% !important;
  transform: translateX(-50%) !important;
}
</style>
