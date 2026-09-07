<script setup lang="ts">
import { ClickerTypes } from "#shared/models/clicker/data/ClickerType";
import { ClickerIconComponentMap } from "@/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "@/services/clicker/properties/ClickerNameMap";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
</script>

<template>
  <v-tooltip v-for="clickerType of ClickerTypes" :key="clickerType" :text="ClickerNameMap[clickerType]">
    <template #activator="{ props }">
      <v-btn b-1 :="props" :active="clicker.type === clickerType" @click="clicker.type = clickerType">
        <component :is="ClickerIconComponentMap[clickerType]" size-8 />
      </v-btn>
    </template>
  </v-tooltip>
</template>

<style scoped>
.v-btn:not(:first-of-type) {
  margin-left: 1rem;
}
</style>
