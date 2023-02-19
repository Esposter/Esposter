<script setup lang="ts">
import { ItemType } from "@/models/clicker";
import { formatNumberLong } from "@/services/clicker/format";
import { marked } from "marked";
import { filename } from "pathe/utils";

// @NOTE: Use this in vue 3.3
// type ItemMenuProps = Pick<Upgrade & Building, "name" | "flavorDescription" | "price"> &
// Partial<Pick<Upgrade & Building, "description" | "amount">>;

type ItemMenuProps = {
  type: ItemType;
  name: string;
  description?: string;
  flavorDescription: string;
  price: number;
  amount?: number;
  isAffordable: boolean;
};

const props = defineProps<ItemMenuProps>();
const { type, name, description, flavorDescription, price, amount, isAffordable } = toRefs(props);
const { error } = useColors();
const slots = useSlots();
const descriptionHtml = computed(() => (description?.value ? marked.parse(description.value) : ""));
const flavorDescriptionHtml = computed(() => marked.parse(`"${flavorDescription.value}"`));
const displayPrice = computed(() => formatNumberLong(price.value));

// @NOTE: Hacky way to do dynamic image paths with nuxt 3 for now
// https://github.com/nuxt/framework/issues/7121
const buildingIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/buildings/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value as unknown as string])
  );
  return images[name.value];
});
const menuIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value as unknown as string])
  );
  return images[name.value];
});
const upgradeIcon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/upgrades/**/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value as unknown as string])
  );
  return images[name.value];
});
</script>

<template>
  <v-menu location="right center" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-list-item :title="name" select="none" :="menuProps">
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
    <v-card max-width="500">
      <v-card-title display="flex!" font="bold!">
        <div>
          <v-img width="2rem" height="2rem" :src="type === ItemType.Building ? menuIcon : upgradeIcon" :alt="name" />
        </div>
        {{ name }}
      </v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
        <div v-if="description" pb="4" v-html="descriptionHtml" />
        <div pb="4" display="flex" justify="end" font="italic">
          <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
          <span text="right" v-html="flavorDescriptionHtml" />
        </div>
        <div :class="{ 'not-affordable': isAffordable }" display="flex">
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
    </v-card>
  </v-menu>
</template>

<!-- @NOTE: Cannot use v-bind with element for v-menu
TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'  -->
<!-- <style scoped lang="scss">
.not-affordable {
  color: v-bind(error);
}
</style> -->
