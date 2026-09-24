<script setup lang="ts">
import { ClickerTypes } from "#shared/models/clicker/data/ClickerType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { ClickerIconComponentMap } from "@/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "@/services/clicker/properties/ClickerNameMap";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
</script>

<template>
  <div aria-label="Clicker type" role="group" flex gap-2>
    <UiTooltip
      v-for="clickerType of ClickerTypes"
      :key="clickerType"
      #default="{ activatorProps }"
      :label="ClickerNameMap[clickerType]"
    >
      <UiButton
        :="activatorProps"
        :aria-label="ClickerNameMap[clickerType]"
        :aria-pressed="clicker.type === clickerType"
        :variant="UiButtonVariant.Quiet"
        px-1
        @click="clicker.type = clickerType"
      >
        <component :is="ClickerIconComponentMap[clickerType]" size-8 />
      </UiButton>
    </UiTooltip>
  </div>
</template>
