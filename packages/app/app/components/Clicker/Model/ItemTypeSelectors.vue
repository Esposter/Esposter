<script setup lang="ts">
import { ClickerTypes } from "#shared/models/clicker/data/ClickerType";
import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
</script>

<template>
  <v-tooltip v-for="clickerType of ClickerTypes" :key="clickerType" :text="NameMap[clickerType]">
    <template #activator="{ props }">
      <v-btn b-1 :="props" :active="clicker.type === clickerType" @click="clicker.type = clickerType">
        <component :is="IconComponentMap[clickerType]" size-8 />
      </v-btn>
    </template>
  </v-tooltip>
</template>

<style scoped>
.v-btn:not(:first-of-type) {
  margin-left: 1rem;
}
</style>
