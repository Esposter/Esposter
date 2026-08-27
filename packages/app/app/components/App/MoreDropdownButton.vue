<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { MoreDropdownLinkItems } from "@/services/app/MoreDropdownLinkItems";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { RoutePath } from "@esposter/shared";
import { mergeProps } from "vue";

const { data: session } = await authClient.useSession(useFetch);
const items = computed<ListLinkItem[]>(() =>
  session.value
    ? [
        {
          href: RoutePath.UserSettings,
          icon: "mdi-cog",
          title: "Settings",
        },
        ...MoreDropdownLinkItems,
        {
          icon: "mdi-logout",
          onClick: () => signOutOfBrowser(),
          title: "Logout",
        },
      ]
    : [
        {
          href: RoutePath.Login,
          icon: "mdi-login",
          title: "Login",
        },
        ...MoreDropdownLinkItems,
      ],
);
const menu = ref(false);
</script>

<template>
  <v-menu v-model="menu" location="bottom start" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip v-if="session" location="bottom" text="Account">
        <template #activator="{ props: tooltipProps }">
          <v-avatar>
            <v-btn h-full :="mergeProps(menuProps, tooltipProps)">
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
    <AppMenuLinkList :items @select="menu = false" />
  </v-menu>
</template>
