<script setup lang="ts">
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { VMenu } from "vuetify/components";

import { Target } from "#shared/models/clicker/data/Target";
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { BuildingIconMap } from "@/services/clicker/icon/BuildingIconMap";
import { MenuIconMap } from "@/services/clicker/icon/MenuIconMap";
import { UpgradeIconMap } from "@/services/clicker/icon/UpgradeIconMap";
import { marked } from "marked";

type ItemMenuProps = Partial<Pick<BuildingWithStatistics, "amount">> &
  Partial<Pick<Upgrade, "description">> &
  Pick<BuildingWithStatistics | Upgrade, "id"> &
  Pick<Upgrade, "flavorDescription" | "price"> & { isAffordable: boolean; menuProps: VMenu["$props"]; type: ItemType };

const slots = defineSlots<{
  action?: () => VNode;
  "append-text"?: () => VNode;
}>();
const { amount, description, flavorDescription, id, isAffordable, menuProps, price, type } =
  defineProps<ItemMenuProps>();
const descriptionHtml = computed(() => (description ? marked.parse(description, { async: false }) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription}"`, { async: false }));
const displayPrice = computed(() => formatNumberLong(price));
const upgradeIcon = computed(() => UpgradeIconMap[id]);
</script>

<template>
  <v-menu :close-on-content-click="false" :="menuProps">
    <template #activator="{ props }">
      <v-list-item :title="id" select-none :="props">
        <template #prepend>
          <NuxtImg
            mr-1
            size-8
            object-contain
            :src="type === Target.Building ? BuildingIconMap[id] : upgradeIcon"
            :alt="id"
          />
        </template>
        <v-list-item-subtitle op-100 flex items-center>
          {{ displayPrice }}
          <div pl-2>
            <ClickerModelItem size-4 />
          </div>
        </v-list-item-subtitle>
        <template v-if="amount" #append>
          <span font-bold>
            {{ amount }}
          </span>
        </template>
      </v-list-item>
    </template>
    <StyledCard>
      <v-card-title font-bold flex>
        <div>
          <NuxtImg size-8 object-contain :src="type === Target.Building ? MenuIconMap[id] : upgradeIcon" :alt="id" />
        </div>
        {{ id }}
      </v-card-title>
      <v-card-text>
        <div v-if="description" pb-4 v-html="descriptionHtml" />
        <div pb-4 flex font-italic justify-end>
          <span text-right v-html="flavorDescriptionHtml" />
        </div>
        <div :class="{ 'text-error': !isAffordable }" flex>
          <v-spacer />
          {{ displayPrice }}
          <div pl-2>
            <ClickerModelItem size-4 />
          </div>
        </div>
      </v-card-text>
      <template v-if="slots['append-text']">
        <v-divider />
        <slot name="append-text" />
      </template>
      <template v-if="slots.action">
        <v-divider />
        <v-card-actions>
          <slot name="action" />
        </v-card-actions>
      </template>
    </StyledCard>
  </v-menu>
</template>
