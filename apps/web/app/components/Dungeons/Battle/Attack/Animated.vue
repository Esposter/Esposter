<script setup lang="ts">
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

interface Props extends AttackProps {
  startSpritesheetKey: SpritesheetKey;
}

defineSlots<{ default: (props: { playAnimationKey: Ref<SpritesheetKey | undefined> }) => VNode }>();
const isActive = defineModel<boolean>("isActive", { required: true });
const { startSpritesheetKey } = defineProps<Props>();
const emit = defineEmits<{ complete: [] }>();
const playAnimationKey = usePlayAnimation(startSpritesheetKey, isActive, emit);
</script>

<template>
  <slot :play-animation-key="playAnimationKey" />
</template>
