<script setup lang="ts">
import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { ItemType } from "@/models/clicker/ItemType";
import type { Upgrade } from "@/models/clicker/Upgrade";
import { formatNumberLong } from "@/services/clicker/format";
import { marked } from "marked";
import { filename } from "pathe/utils";
import type { VMenu } from "vuetify/components";

type ItemMenuProps = { type: ItemType; isAffordable: boolean; menuProps: VMenu["$props"] } & Pick<
  Upgrade | BuildingWithStats,
  "name"
> &
  Pick<Upgrade, "flavorDescription" | "price"> &
  Partial<Pick<Upgrade, "description">> &
  Partial<Pick<BuildingWithStats, "amount">>;

const props = defineProps<ItemMenuProps>();
const { type, isAffordable, menuProps, name, description, flavorDescription, price, amount } = toRefs(props);
const slots = defineSlots<{
  "append-text"?: (props: {}) => unknown;
  action?: (props: {}) => unknown;
}>();
const { error } = useColors();

const descriptionHtml = computed(() => (description?.value ? marked.parse(description.value) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription.value}"`));
const displayPrice = computed(() => formatNumberLong(price.value));

const buildingIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/buildings/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value as string]));
  return images[name.value];
});
const menuIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value as string]));
  return images[name.value];
});
const upgradeIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/upgrades/**/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value as string]));
  return images[name.value];
});
</script>

<template>
  <v-menu :close-on-content-click="false" :="menuProps">
    <template #activator="{ props: activatorProps }">
      <v-list-item :title="name" select="none" :="activatorProps">
        <template #prepend>
          <v-img
            mr="1"
            width="2rem"
            height="2rem"
            :src="type === ItemType.Building ? buildingIcon : upgradeIcon"
            :alt="name"
          />
        </template>
        <v-list-item-subtitle op="100!">
          {{ displayPrice }}
          <ClickerModelPinaColada width="16" height="16" />
        </v-list-item-subtitle>
        <template v-if="amount" #append>
          <span font="bold">
            {{ amount }}
          </span>
        </template>
      </v-list-item>
    </template>
    <StyledCard>
      <v-card-title display="flex!" font="bold!">
        <div>
          <v-img width="2rem" height="2rem" :src="type === ItemType.Building ? menuIcon : upgradeIcon" :alt="name" />
        </div>
        {{ name }}
      </v-card-title>
      <v-card-text>
        <div v-if="description" pb="4" v-html="descriptionHtml" />
        <div pb="4" display="flex" justify="end" font="italic">
          <span text="right" v-html="flavorDescriptionHtml" />
        </div>
        <div :class="{ 'not-affordable': !isAffordable }" display="flex">
          <v-spacer />
          {{ displayPrice }} <ClickerModelPinaColada width="16" height="16" />
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

<!-- @NOTE: This doesn't actually work, css binding doesn't work with v-menu -->
<style scoped lang="scss">
.not-affordable {
  color: v-bind(error);
}
</style>
