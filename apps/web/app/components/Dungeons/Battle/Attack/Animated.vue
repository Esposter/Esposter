<script setup lang="ts">
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

interface Props {
  startSpritesheetKey: SpritesheetKey;
}

defineSlots<{ default: (props: { playAnimationKey: Ref<SpritesheetKey | undefined> }) => VNode }>();
const isActive = defineModel<boolean>("isActive", { required: true });
const { startSpritesheetKey } = defineProps<Props>();
const emit = defineEmits<{ complete: [] }>();
// The key is held in a plain object so the template hands the slot its Ref, not the value a top-level ref would unwrap to
const animation = { playAnimationKey: usePlayAnimation(startSpritesheetKey, isActive, emit) };
</script>

<template>
  <slot :play-animation-key="animation.playAnimationKey" />
</template>
