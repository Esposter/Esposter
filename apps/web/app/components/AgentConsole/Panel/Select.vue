<script setup lang="ts" generic="T extends string">
import type { MenuItem } from "@/models/agentConsole/MenuItem";

interface Props {
  items: MenuItem<T>[];
  label: string;
}

const modelValue = defineModel<T>({ required: true });
const { items, label } = defineProps<Props>();
const selectedTitle = computed(() => items.find(({ value }) => value === modelValue.value)?.title ?? label);
const isOpen = ref(false);
const select = useTemplateRef("select");

onClickOutside(select, () => {
  isOpen.value = false;
});
</script>

<template>
  <div ref="select">
    <AgentConsolePanelButton
      :aria-expanded="isOpen"
      :aria-label="label"
      aria-haspopup="listbox"
      @click="isOpen = !isOpen"
    >
      {{ items.find(({ value }) => value === modelValue)?.title ?? label }} ▴
    </AgentConsolePanelButton>
    <!-- Opens upward where there is room, as most selects sit at the foot of a panel, and flips below where not -->
    <AgentConsolePanelPopover v-if="isOpen" placement="top-start" :reference="select ?? undefined">
      <AgentConsolePanelMenu
        :items
        :label
        :selected-value="modelValue"
        min-h-0
        @keydown.escape.stop="isOpen = false"
        @select="
          (value) => {
            modelValue = value;
            isOpen = false;
          }
        "
      />
    </AgentConsolePanelPopover>
  </div>
</template>
