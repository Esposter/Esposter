<script setup lang="ts">
import type { ClickerType } from "#shared/models/clicker/data/ClickerType";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { ClickerTypes } from "#shared/models/clicker/data/ClickerType";
import { ClickerIconComponentMap } from "@/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "@/services/clicker/properties/ClickerNameMap";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const clickerTypeItems = ClickerTypes.map<UiMenuItem<ClickerType>>((clickerType) => ({
  title: ClickerNameMap[clickerType],
  value: clickerType,
}));
</script>

<template>
  <UiToggleGroup v-model="clicker.type" is-icon-only :items="clickerTypeItems" label="Clicker type">
    <template #mark="{ item }">
      <component :is="ClickerIconComponentMap[item.value]" size-6 />
    </template>
  </UiToggleGroup>
</template>
