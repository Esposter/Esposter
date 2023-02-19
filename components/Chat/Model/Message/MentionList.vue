<script setup lang="ts">
interface MessageMentionListProps {
  items: string[];
  command: (props: Record<string, unknown>) => void;
}

const props = defineProps<MessageMentionListProps>();
const { items, command } = toRefs(props);
const selectedIndex = ref(0);
const selectItem = (index: number) => {
  const item = items.value[index];
  if (item) command.value({ id: item });
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
  <div class="items">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="item"
        :class="{ 'is-selected': index === selectedIndex }"
        @click="selectItem(index)"
      >
        {{ item }}
      </button>
    </template>
    <div v-else class="item">No result</div>
  </div>
</template>

<style lang="scss">
.items {
  padding: 0.2rem;
  position: relative;
  border-radius: 0.5rem;
  background: #fff;
  color: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  font-size: 0.9rem;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
}

.item {
  display: block;
  margin: 0;
  width: 100%;
  text-align: left;
  background: transparent;
  border-radius: 0.4rem;
  border: 1px solid transparent;
  padding: 0.2rem 0.4rem;

  &.is-selected {
    border-color: #000;
  }
}
</style>
