<script setup lang="ts">
interface Props {
  color?: string;
  icon: string;
  tooltip: string;
  variant: "plain" | "tonal";
}

const { color, icon, tooltip, variant } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
const wrapper = useTemplateRef("wrapper");
// Vuetify positions the tooltip against the main window, so inside a Document PiP window attach it
// To this wrapper and let the .call-pip-tooltip-wrapper overrides anchor it to the button via CSS.
const attach = ref<HTMLElement>();

onMounted(() => {
  if (wrapper.value && wrapper.value.ownerDocument !== window.document) attach.value = wrapper.value;
});
</script>

<template>
  <div ref="wrapper" flex relative class="call-pip-tooltip-wrapper">
    <v-tooltip :text="tooltip" :attach>
      <template #activator="{ props }">
        <v-btn :="props" :icon :color size="default" :variant :ripple="false" @click="emit('click')" />
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
/* When attached to the wrapper (PiP window only — otherwise the overlay teleports out and these
   selectors do not match), anchor the tooltip to the button instead of Vuetify's main-window coords. */
.call-pip-tooltip-wrapper :deep(.v-overlay) {
  position: absolute !important;
  inset: 0 !important;
}

.call-pip-tooltip-wrapper :deep(.v-overlay__content) {
  position: absolute !important;
  inset: auto auto calc(100% + 0.25rem) 50% !important;
  transform: translateX(-50%) !important;
}
</style>
