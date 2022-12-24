<script setup lang="ts">
import {
  ABOUT_PATH,
  CLICKER_PATH,
  LOGIN_PATH,
  PRIVACY_POLICY_PATH,
  TERMS_AND_CONDITIONS_PATH,
} from "@/util/constants.common";
import { mergeProps } from "vue";

interface Item {
  title: string;
  href: string;
  icon: string;
}

const items: Item[] = [
  {
    title: "Login",
    href: LOGIN_PATH,
    icon: "mdi-login",
  },
  {
    title: "Piña Colada Clicker",
    href: CLICKER_PATH,
    icon: "mdi-fruit-pineapple",
  },
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
const menu = $ref(false);
</script>

<template>
  <v-menu v-model="menu" location="bottom start" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="More">
        <template #activator="{ props: tooltipProps }">
          <v-avatar color="background">
            <v-btn icon="mdi-chevron-down" :="mergeProps(menuProps, tooltipProps)" />
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
    <v-list min-width="250">
      <InvisibleNuxtLink v-for="item in items" :key="item.title" :to="item.href" @click="menu = false">
        <v-list-item :value="item.title">
          <template #prepend>
            <v-avatar color="background">
              <v-icon :icon="item.icon" />
            </v-avatar>
          </template>
          <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </InvisibleNuxtLink>
    </v-list>
  </v-menu>
</template>
