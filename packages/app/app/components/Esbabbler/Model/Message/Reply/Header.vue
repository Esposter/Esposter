<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

interface ReplyHeaderProps {
  userId: string;
}

const { userId } = defineProps<ReplyHeaderProps>();
const emit = defineEmits<{ close: [] }>();
const { text } = useColors();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const creator = computed(() => members.value.find(({ id }) => id === userId));
</script>

<template>
  <div v-if="creator" class="bg-background" relative text-sm px-4 py-2 rd-t-2>
    Replying to <span font-bold>{{ creator.name }}</span>
    <v-btn
      class="custom-border"
      absolute
      top="1/2"
      right-4
      translate-y="-1/2"
      icon="mdi-close"
      size="small"
      density="compact"
      @click="emit('close')"
    />
  </div>
</template>

<style scoped lang="scss">
.custom-border {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
