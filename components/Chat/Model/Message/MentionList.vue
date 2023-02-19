<script setup lang="ts">
import type { User } from "@prisma/client";

interface MessageMentionListProps {
  items: User[];
  command: (props: Record<string, unknown>) => void;
}

const props = defineProps<MessageMentionListProps>();
const { items, command } = toRefs(props);
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = items.value[index];
  if (item) command.value({ id: item.name });
};
const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === "ArrowUp") {
    selectedIndex.value = (selectedIndex.value + items.value.length - 1) % items.value.length;
    return true;
  }

  if (event.key === "ArrowDown") {
    selectedIndex.value = (selectedIndex.value + 1) % items.value.length;
    return true;
  }

  if (event.key === "Enter") {
    selectItem(selectedIndex.value);
    return true;
  }

  return false;
};

defineExpose({ onKeyDown });

watch(
  items,
  () => {
    selectedIndex.value = 0;
  },
  { deep: true }
);
</script>

<template>
  <div>
    <StyledCard :style="{ overflow: 'auto' }" max-height="250" width="450">
      <v-btn
        v-for="(item, index) in items"
        :key="index"
        w="full"
        justify="start!"
        rd="1"
        :ripple="false"
        :color="index === selectedIndex ? 'background' : undefined"
        @click="selectItem(index)"
      >
        <v-avatar v-if="item.image" size="x-small">
          <v-img :src="item.image" :alt="item.name ?? undefined" />
        </v-avatar>
        <span pl="2" font="bold" case="normal">
          {{ item.name }}
        </span>
      </v-btn>
      <span v-if="items.length === 0" font="bold">No result</span>
    </StyledCard>
  </div>
</template>
