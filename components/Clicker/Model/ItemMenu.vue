<script setup lang="ts">
import { marked } from "marked";
import { filename } from "pathe/utils";

// @NOTE: Use this in vue 3.3
// type ItemMenuProps = {
//   isAffordable: boolean;
//   isBuyable?: true;
// } & Pick<Upgrade & Building, "name" | "flavorDescription" | "price"> &
//   Partial<Pick<Upgrade & Building, "description" | "level">>;

type ItemMenuProps = {
  name: string;
  description?: string;
  flavorDescription: string;
  price: number;
  level?: number;
  isAffordable: boolean;
  isBuyable?: true;
};

const props = defineProps<ItemMenuProps>();
const { name, description, flavorDescription, price, level, isAffordable, isBuyable } = $(toRefs(props));
const emit = defineEmits<{ (event: "buy", value: MouseEvent): void }>();
// @NOTE: Can remove cast after it's fixed in vue 3.3
const descriptionHtml = $computed(() => (description ? marked.parse(description as unknown as string) : null));
const flavorDescriptionHtml = $computed(() => marked.parse(flavorDescription));
const menu = $ref(false);
// @NOTE: Hacky way to do dynamic image paths with nuxt 3 for now
// https://github.com/nuxt/framework/issues/7121
const icon = $computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value as unknown as string])
  );
  return images[name];
});
</script>

<template>
  <v-menu v-model="menu" location="right center" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-list-item select="none" :="menuProps">
        <template #prepend>
          <img width="32" height="32" :src="icon" :alt="name" />
        </template>
        <template #title>
          <span>
            {{ name }}
          </span>
        </template>
        <template v-if="level" #append>
          <span font="bold">
            {{ level }}
          </span>
        </template>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title class="text-subtitle-1" display="flex!" font="bold!">
        <img width="32" height="32" :src="icon" :alt="name" />
        {{ name }}
      </v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
        <div v-if="description" pb="4" v-html="descriptionHtml" />
        <div pb="4" display="flex" justify="end" font="italic">
          "
          <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
          <span v-html="flavorDescriptionHtml" />
          "
        </div>
        <div display="flex">
          <v-spacer />
          {{ price }} <ClickerModelPinaColada width="24" height="24" />
        </div>
      </v-card-text>
      <template v-if="isBuyable">
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <StyledButton :button-props="{ disabled: !isAffordable }" @click="(e) => emit('buy', e)">Buy</StyledButton>
        </v-card-actions>
      </template>
    </v-card>
  </v-menu>
</template>

<!-- @NOTE: Seems like reactivity transform doesn't work with v-bind -->
<!-- This might be fixed in Vue 3.3 -->
<!-- <style scoped lang="scss">
.not-affordable {
  color: v-bind(error);
}
</style> -->
