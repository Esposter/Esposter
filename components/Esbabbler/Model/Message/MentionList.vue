<script setup lang="ts">
import type { User } from "@prisma/client";

interface MessageMentionListProps {
  items: User[];
  command: (props: Record<string, unknown>) => void;
}

const { items, command } = defineProps<MessageMentionListProps>();
const { infoOpacity10 } = useColors();
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = items[index];
  if (item) command({ id: item.id, label: item.name });
};
const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === "ArrowUp") {
    selectedIndex.value = (selectedIndex.value + items.length - 1) % items.length;
    return true;
  }

  if (event.key === "ArrowDown") {
    selectedIndex.value = (selectedIndex.value + 1) % items.length;
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
  () => items,
  () => {
    selectedIndex.value = 0;
  },
  { deep: true },
);
</script>

<template>
  <div>
    <StyledCard :style="{ overflow: 'auto' }" max-height="250" width="400">
      <v-btn
        v-for="(item, index) in items"
        :key="item.id"
        :style="{ backgroundColor: infoOpacity10 }"
        w="full"
        justify="start!"
        rd
        :ripple="false"
        @click="selectItem(index)"
      >
        <v-avatar v-if="item.image" size="x-small">
          <v-img :src="item.image" :alt="item.name ?? undefined" />
        </v-avatar>
        <span pl="2" font="bold" case="normal">
          {{ item.name }}
        </span>
      </v-btn>
      <div v-if="items.length === 0" p="2" text="center" font="bold">No result</div>
    </StyledCard>
  </div>
</template>
