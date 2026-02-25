<script setup lang="ts">
import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { VMenu } from "vuetify/components";

import { Target } from "#shared/models/clicker/data/Target";
import { formatNumberLong } from "@/services/clicker/format";
import { marked } from "marked";
import { filename } from "pathe/utils";

type ItemMenuProps = Partial<Pick<BuildingWithStats, "amount">> &
  Partial<Pick<Upgrade, "description">> &
  Pick<BuildingWithStats | Upgrade, "id"> &
  Pick<Upgrade, "flavorDescription" | "price"> & { isAffordable: boolean; menuProps: VMenu["$props"]; type: ItemType };

const { amount, description, flavorDescription, id, isAffordable, menuProps, price, type } =
  defineProps<ItemMenuProps>();
const slots = defineSlots<{
  action?: () => VNode;
  "append-text"?: () => VNode;
}>();
const { error } = useColors();
const descriptionHtml = computed(() => (description ? marked.parse(description, { async: false }) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription}"`, { async: false }));
const displayPrice = computed(() => formatNumberLong(price));
const buildingIcon = computed(() => {
  const glob = import.meta.glob<string>("@/assets/clicker/icons/buildings/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value]));
  return images[id];
});
const menuIcon = computed(() => {
  const glob = import.meta.glob<string>("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value]));
  return images[id];
});
const upgradeIcon = computed(() => {
  const glob = import.meta.glob<string>("@/assets/clicker/icons/upgrades/**/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value]));
  return images[id];
});
</script>

<template>
  <v-menu :close-on-content-click="false" :="menuProps">
    <template #activator="{ props }">
      <v-list-item :title="id" select-none :="props">
        <template #prepend>
          <v-img
            mr-1
            width="2rem"
            height="2rem"
            :src="type === Target.Building ? buildingIcon : upgradeIcon"
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
      <v-card-title flex font-bold>
        <div>
          <v-img width="2rem" height="2rem" :src="type === Target.Building ? menuIcon : upgradeIcon" :alt="id" />
        </div>
        {{ id }}
      </v-card-title>
      <v-card-text>
        <div v-if="description" pb-4 v-html="descriptionHtml" />
        <div pb-4 flex justify-end font-italic>
          <span text-right v-html="flavorDescriptionHtml" />
        </div>
        <div :class="{ 'not-affordable': !isAffordable }" flex>
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
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped lang="scss">
.not-affordable {
  color: v-bind(error);
}
</style>
