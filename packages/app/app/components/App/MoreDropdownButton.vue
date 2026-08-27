<script setup lang="ts">
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { MoreDropdownLinkItems } from "@/services/app/MoreDropdownLinkItems";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { RoutePath } from "@esposter/shared";

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
  <!-- Signed in the activator is the reader's own avatar, signed out it is a chevron on the same background
       plate the products grid beside it uses — one control either way, so the menu, its tooltip and the
       activator's props stay the shared shell's problem rather than a hand-merged stack per branch -->
  <v-avatar :color="session ? '' : 'background'">
    <StyledTooltipMenuIconButton
      v-model="menu"
      :button-props="session ? { height: '100%' } : {}"
      :icon="session ? '' : 'mdi-chevron-down'"
      :menu-props="{ closeOnContentClick: false, location: 'bottom start' }"
      :text="session ? 'Account' : 'More'"
      :tooltip-props="{ location: 'bottom' }"
    >
      <template v-if="session" #activator>
        <StyledAvatar :image="session.user.image" :name="session.user.name" />
      </template>
      <AppMenuLinkList :items @select="menu = false" />
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
