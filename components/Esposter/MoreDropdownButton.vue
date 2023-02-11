<script setup lang="ts">
import { RoutePath } from "@/models/router";
import { mergeProps } from "vue";

interface Item {
  title: string;
  href?: string;
  icon: string;
  onClick?: () => Promise<void>;
}

const { status, data, signOut } = $(useSession());

const items = $computed<Item[]>(() =>
  status === "unauthenticated"
    ? [
        {
          title: "Login",
          href: RoutePath.Login,
          icon: "mdi-login",
        },
        {
          title: `${ITEM_NAME} Clicker`,
          href: RoutePath.Clicker,
          icon: "mdi-fruit-pineapple",
        },
        {
          title: "About",
          href: RoutePath.About,
          icon: "mdi-information-outline",
        },
        {
          title: "Privacy Policy",
          href: RoutePath.PrivacyPolicy,
          icon: "mdi-lock",
        },
        {
          title: "Terms & Conditions",
          href: RoutePath.TermsAndConditions,
          icon: "mdi-shield-lock",
        },
      ]
    : status === "authenticated"
    ? [
        {
          title: `${ITEM_NAME} Clicker`,
          href: RoutePath.Clicker,
          icon: "mdi-fruit-pineapple",
        },
        {
          title: "Settings",
          href: RoutePath.UserSettings,
          icon: "mdi-cog",
        },
        {
          title: "About",
          href: RoutePath.About,
          icon: "mdi-information-outline",
        },
        {
          title: "Privacy Policy",
          href: RoutePath.PrivacyPolicy,
          icon: "mdi-lock",
        },
        {
          title: "Terms & Conditions",
          href: RoutePath.TermsAndConditions,
          icon: "mdi-shield-lock",
        },
        {
          title: "Logout",
          icon: "mdi-logout",
          onClick: signOut,
        },
      ]
    : []
);
const menu = $ref(false);
</script>

<template>
  <v-menu v-model="menu" location="bottom start" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip v-if="status === 'authenticated' && data" location="bottom" text="Account">
        <template #activator="{ props: tooltipProps }">
          <v-avatar>
            <v-btn :="mergeProps(menuProps, tooltipProps)">
              <v-avatar v-if="data.user.image">
                <v-img :src="data.user.image" />
              </v-avatar>
              <DefaultAvatar v-else :name="data.user.name ?? ''" />
            </v-btn>
          </v-avatar>
        </template>
      </v-tooltip>
      <v-tooltip v-else location="bottom" text="More">
        <template #activator="{ props: tooltipProps }">
          <v-avatar color="background">
            <v-btn icon="mdi-chevron-down" :="mergeProps(menuProps, tooltipProps)" />
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
    <v-list min-width="250">
      <NuxtInvisibleLink
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
      </NuxtInvisibleLink>
    </v-list>
  </v-menu>
</template>
