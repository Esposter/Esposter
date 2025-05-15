<script setup lang="ts">
import { ClickerType } from "#shared/models/clicker/data/ClickerType";
import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
</script>

<template>
  <v-tooltip v-for="clickerType of Object.values(ClickerType)" :key="clickerType" :text="NameMap[clickerType]">
    <template #activator="{ props }">
      <v-btn
        class="bg-surface border-sm"
        :="props"
        :active="clicker.type === clickerType"
        @click="clicker.type = clickerType"
      >
        <svg size-8 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <g>
            <component :is="IconComponentMap[clickerType]" />
          </g>
        </svg>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<style scoped lang="scss">
.v-btn:not(:first-of-type) {
  margin-left: 1rem;
}
</style>
