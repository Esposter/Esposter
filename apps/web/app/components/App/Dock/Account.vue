<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { AccountMenuAction } from "@/models/app/AccountMenuAction";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";
import { RoutePath } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const { global } = useVTheme();
// Vuetify types its theme name as a bare string, while the themes it is given are exactly `ThemeMode`
const currentTheme = computed(() => global.name.value as ThemeMode);
const toggleTheme = useToggleTheme();
// The rarely used behind one step: the reader's settings, the theme, the pages outside the products, and signing
// In or out. Signed out, the same menu leads with signing in
const items = computed<UiMenuItem<string>[]>(() => [
  session.value
    ? { icon: "i-mdi:cog", title: "Settings", value: RoutePath.UserSettings }
    : { icon: "i-mdi:login", title: "Sign in", value: RoutePath.Login },
  {
    description: ThemeModeTooltipMap[currentTheme.value],
    icon: ThemeModeIconMap[currentTheme.value],
    title: "Theme",
    value: AccountMenuAction.ToggleTheme,
  },
  ...SecondaryPageLinkItems.map(({ href, icon, title }) => ({ icon, title, value: href })),
  ...(session.value ? [{ icon: "i-mdi:logout", title: "Sign out", value: AccountMenuAction.SignOut }] : []),
]);
</script>

<template>
  <UiMenu
    :items
    :label="session ? 'Account' : 'Sign in and more'"
    :position-area="DOCK_POPOVER_POSITION_AREA"
    p-0
    size-10
    @select="
      async (value) => {
        if (value === AccountMenuAction.ToggleTheme) await toggleTheme();
        else if (value === AccountMenuAction.SignOut) await signOutOfBrowser();
        else {
          const isExternal = SecondaryPageLinkItems.some((item) => item.href === value && 'external' in item);
          await navigateTo(value, isExternal ? { external: true, open: { target: '_blank' } } : undefined);
        }
      }
    "
  >
    <UiAvatar v-if="session" :image="session.user.image ?? ''" :name="session.user.name" />
    <UiIcon v-else :meaning="UiIconMeaning.SignIn" />
  </UiMenu>
</template>
