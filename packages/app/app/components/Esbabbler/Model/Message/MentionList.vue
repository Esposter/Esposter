<script setup lang="ts">
import type { User } from "#shared/db/schema/users";

interface MessageMentionListProps {
  command: (props: Record<string, unknown>) => void;
  items: User[];
}

const { command, items } = defineProps<MessageMentionListProps>();
const { infoOpacity10 } = useColors();
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = items[index];
  command({ id: item.id, label: item.name });
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
    <StyledCard overflow-y-auto :card-props="{ maxHeight: '250', width: '400' }">
      <v-btn
        v-for="({ id, image, name }, index) of items"
        :key="id"
        class="button"
        w-full
        rd
        justify-start
        :ripple="false"
        @click="selectItem(index)"
      >
        <StyledAvatar :image :name :avatar-props="{ size: 'x-small' }" />
        <span font-bold pl-2>
          {{ name }}
        </span>
      </v-btn>
      <div v-if="items.length === 0" font-bold text-center p-2>No result</div>
    </StyledCard>
  </div>
</template>

<style scoped lang="scss">
.button {
  background-color: v-bind(infoOpacity10) !important;
}
</style>
