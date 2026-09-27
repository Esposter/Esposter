<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
</script>

<template>
  <!-- Three columns, so the type selectors stay centred whichever drawer buttons show -->
  <header grid w-full items-center grid-cols="[1fr_auto_1fr]">
    <AppDrawerButton label="Store" :meaning="UiIconMeaning.Store" justify-self-start />
    <ClickerModelItemTypeSelectors col-start-2 />
    <AppDrawerButton is-end label="Inventory" :meaning="UiIconMeaning.Inventory" col-start-3 justify-self-end />
  </header>
</template>
