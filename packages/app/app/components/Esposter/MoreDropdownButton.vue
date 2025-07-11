<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { RoutePath } from "#shared/models/router/RoutePath";
import { authClient } from "@/services/auth/authClient";
import { mergeProps } from "vue";

const { data: session } = await authClient.useSession(useFetch);
const { signOut } = authClient;
const items = computed<ListLinkItem[]>(() => {
  const commonItems: ListLinkItem[] = [
    {
      href: RoutePath.About,
      icon: "mdi-information",
      title: "About",
    },
    {
      external: true,
      href: RoutePath.Docs,
      icon: "mdi-book-open-page-variant",
      title: "Documentation",
      trailingSlash: "append",
    },
    {
      href: RoutePath.Anime,
      icon: "custom:anime",
      title: "Anime",
    },
    {
      href: RoutePath.PrivacyPolicy,
      icon: "mdi-lock",
      title: "Privacy Policy",
    },
  ];
  return session.value
    ? [
        {
          href: RoutePath.UserSettings,
          icon: "mdi-cog",
          title: "Settings",
        },
        ...commonItems,
        {
          icon: "mdi-logout",
          onClick: async () => {
            await signOut();
            window.location.reload();
          },
          title: "Logout",
        },
      ]
    : [
        {
          href: RoutePath.Login,
          icon: "mdi-login",
          title: "Login",
        },
        ...commonItems,
      ];
});
const menu = ref(false);
</script>

<template>
  <v-menu v-model="menu" location="bottom start" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip v-if="session" location="bottom" text="Account">
        <template #activator="{ props: tooltipProps }">
          <v-avatar>
            <v-btn h-full="!" :="mergeProps(menuProps, tooltipProps)">
              <StyledAvatar :image="session.user.image" :name="session.user.name" />
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
        v-for="{ icon, title, href, onClick, ...rest } of items"
        :key="title"
        :to="href"
        :="rest"
        @click="
          async () => {
            await onClick?.();
            menu = false;
          }
        "
      >
        <v-list-item :value="title">
          <template #prepend>
            <v-avatar color="background">
              <v-icon :icon />
            </v-avatar>
          </template>
          <v-list-item-title font-bold="!">{{ title }}</v-list-item-title>
        </v-list-item>
      </NuxtInvisibleLink>
    </v-list>
  </v-menu>
</template>
