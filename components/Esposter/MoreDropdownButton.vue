<script setup lang="ts">
import { ITEM_NAME } from "@/util/constants.client";
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
  href?: string;
  icon: string;
  onClick?: () => Promise<void>;
}

const { status, signOut } = $(useSession());

const items = $computed(() => {
  const result: Item[] = [
    {
      title: `${ITEM_NAME} Clicker`,
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

  if (status === "unauthenticated")
    result.unshift({
      title: "Login",
      href: LOGIN_PATH,
      icon: "mdi-login",
    });
  else if (status === "authenticated")
    result.push({
      title: "Logout",
      icon: "mdi-logout",
      onClick: signOut,
    });

  return result;
});
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
      <InvisibleNuxtLink
        v-for="item in items"
        :key="item.title"
        :to="item.href"
        @click="
          async () => {
            await item.onClick?.();
            menu = false;
          }
        "
      >
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
