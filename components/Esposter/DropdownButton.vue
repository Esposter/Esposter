<script setup lang="ts">
import { ABOUT_PATH, PRIVACY_POLICY_PATH, TERMS_AND_CONDITIONS_PATH } from "@/util/constants";
import { mergeProps } from "vue";

interface Item {
  title: string;
  href: string;
  icon: string;
}

const items: Item[] = [
  {
    title: "About",
    href: ABOUT_PATH,
    icon: "mdi-information-outline",
  },
  {
    title: "Privacy Policy",
    href: PRIVACY_POLICY_PATH,
    icon: "mdi-lock",
  },
  {
    title: "Terms & Conditions",
    href: TERMS_AND_CONDITIONS_PATH,
    icon: "mdi-shield-lock",
  },
];
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <!-- @NOTE <v-tooltip location="bottom" text="More">
          <template #activator="{ props: tooltipProps }"> -->
      <v-btn icon="mdi-dots-vertical" :="mergeProps(menuProps)" />
      <!-- </template>
        </v-tooltip> -->
    </template>
    <v-list>
      <InvisibleNuxtLink v-for="item in items" :key="item.title" :to="item.href">
        <v-list-item :value="item.title">
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
          <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </InvisibleNuxtLink>
    </v-list>
  </v-menu>
</template>
