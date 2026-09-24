<script setup lang="ts">
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { BuildingIconMap } from "@/services/clicker/icon/BuildingIconMap";
import { MenuIconMap } from "@/services/clicker/icon/MenuIconMap";
import { UpgradeIconMap } from "@/services/clicker/icon/UpgradeIconMap";
import { marked } from "marked";

type Props = Partial<Pick<BuildingWithStatistics, "amount">> &
  Partial<Pick<Upgrade, "description">> &
  Pick<BuildingWithStatistics | Upgrade, "id"> &
  Pick<Upgrade, "flavorDescription" | "price"> & { isAffordable: boolean; positionArea: string; type: ItemType };

const slots = defineSlots<{
  action?: () => VNode;
  "append-text"?: () => VNode;
}>();
const { amount, description, flavorDescription, id, isAffordable, positionArea, price, type } = defineProps<Props>();
const descriptionHtml = computed(() => (description ? marked.parse(description, { async: false }) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription}"`, { async: false }));
const displayPrice = computed(() => formatNumberLong(price));
const upgradeIcon = computed(() => UpgradeIconMap[id]);
</script>

<template>
  <li>
    <!-- @TODO: a row of a UiList cannot be a popover's trigger yet, so the row is the popover's own quiet button -->
    <UiPopover :label="id" :position-area :variant="UiButtonVariant.Quiet" w-full select-none>
      <template #trigger>
        <NuxtImg
          size-8
          object-contain
          :src="type === Target.Building ? BuildingIconMap[id] : upgradeIcon"
          alt=""
          aria-hidden="true"
        />
        <span text-left flex-1 min-w-0>
          <span text-text block truncate>{{ id }}</span>
          <!-- A price still to pay reads green while it can be paid and red while it cannot, as Cookie Clicker's does -->
          <span
            :class="slots.action ? (isAffordable ? 'text-success' : 'text-error') : 'text-muted'"
            text-sm
            flex
            gap-1
            items-center
          >
            {{ displayPrice }}
            <ClickerModelItem size-4 />
          </span>
        </span>
        <span v-if="amount" ui-title>{{ amount }}</span>
      </template>
      <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
        <header flex gap-2 items-center>
          <NuxtImg
            size-8
            object-contain
            :src="type === Target.Building ? MenuIconMap[id] : upgradeIcon"
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
    </UiPopover>
  </li>
</template>
