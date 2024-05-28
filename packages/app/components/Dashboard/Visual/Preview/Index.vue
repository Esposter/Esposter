<script setup lang="ts">
import type { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeDemoComponentMap } from "@/services/dashboard/demo/VisualTypeDemoComponentMap";

interface VisualPreviewProps {
  type: VisualType;
}

const { type } = defineProps<VisualPreviewProps>();
const emit = defineEmits<{ click: [] }>();
const isDrag = ref(false);
const isMouseDown = ref(false);
</script>

<template>
  <Transition name="fade">
    <component
      :is="VisualTypeDemoComponentMap[type]"
      size="90%"
      @mousedown="isMouseDown = true"
      @mouseup="
        () => {
          isMouseDown = false;
          if (isDrag) isDrag = false;
          else emit('click');
        }
      "
      @mousemove="
        () => {
          if (!isMouseDown) return;
          isDrag = true;
        }
      "
    />
  </Transition>
</template>
