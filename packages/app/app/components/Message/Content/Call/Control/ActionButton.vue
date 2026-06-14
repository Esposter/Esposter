<script setup lang="ts">
interface CallActionButtonProps {
  color?: string;
  icon: string;
  tooltip: string;
  variant: "plain" | "tonal";
}

const { color, icon, tooltip, variant } = defineProps<CallActionButtonProps>();
const emit = defineEmits<{ click: [] }>();
const activator = useTemplateRef("activator");
// When teleported into a Document PiP window, the tooltip overlay must attach to that document's
// body (instead of the main overlay container) so it anchors to the button inside the PiP window.
const attach = ref<HTMLElement>();

onMounted(() => {
  const ownerDocument = activator.value?.$el.ownerDocument;
  if (ownerDocument && ownerDocument !== document) attach.value = ownerDocument.body;
});
</script>

<template>
  <v-tooltip :text="tooltip" location="top" :attach>
    <template #activator="{ props }">
      <v-btn ref="activator" :="props" :icon :color size="default" :variant :ripple="false" @click="emit('click')" />
    </template>
  </v-tooltip>
</template>
