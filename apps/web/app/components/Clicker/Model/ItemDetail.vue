<script setup lang="ts">
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { MenuIconMap } from "@/services/clicker/icon/MenuIconMap";
import { UpgradeIconMap } from "@/services/clicker/icon/UpgradeIconMap";
import { marked } from "marked";

type Props = Partial<Pick<BuildingWithStatistics, "amount">> &
  Partial<Pick<Upgrade, "description">> &
  Pick<BuildingWithStatistics | Upgrade, "id"> &
  Pick<Upgrade, "flavorDescription" | "price"> & { isAffordable: boolean; type: ItemType };
// What the store and the inventory say of one item once its row is pressed: its picture and name, what it does, its
// Flavour line and its price beside whatever buys it
const slots = defineSlots<{
  action?: () => VNode;
  "append-text"?: () => VNode;
}>();
const { amount, description, flavorDescription, id, isAffordable, price, type } = defineProps<Props>();
const descriptionHtml = computed(() => (description ? marked.parse(description, { async: false }) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription}"`, { async: false }));
const displayPrice = computed(() => formatNumberLong(price));
</script>

<template>
  <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
    <header flex gap-2 items-center>
      <NuxtImg
        size-8
        object-contain
        :src="type === Target.Building ? MenuIconMap[id] : UpgradeIconMap[id]"
        alt=""
        aria-hidden="true"
      />
      <h3 flex-1 truncate ui-title>{{ id }}</h3>
      <span v-if="amount" text-sm text-muted>{{ amount }} owned</span>
    </header>
    <div v-if="description" v-html="descriptionHtml" />
    <div text-muted text-right italic v-html="flavorDescriptionHtml" />
    <slot name="append-text" />
    <footer flex gap-2 items-center>
      <span :class="{ 'text-error': slots.action && !isAffordable }" flex flex-1 gap-1 items-center>
        {{ displayPrice }}
        <ClickerModelItem size-4 />
      </span>
      <slot name="action" />
    </footer>
  </div>
</template>
