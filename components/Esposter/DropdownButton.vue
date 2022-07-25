<script setup lang="ts">
import { ABOUT_PATH, PRIVACY_POLICY_PATH, TERMS_AND_CONDITIONS_PATH } from "@/util/constants";

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
    <template #activator="{ props }">
      <v-avatar color="background">
        <v-btn class="background" icon="mdi-dots-vertical" :="props" />
      </v-avatar>
    </template>
    <v-card min-width="300">
      <v-list>
        <InvisibleNuxtLink v-for="item in items" :key="item.title" :to="item.href">
          <v-list-item :value="item.title">
            <v-list-item-avatar class="background" start>
              <v-icon :icon="item.icon" />
            </v-list-item-avatar>
            <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </InvisibleNuxtLink>
      </v-list>
    </v-card>
  </v-menu>
</template>
