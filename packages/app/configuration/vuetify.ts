import type { NuxtConfig } from "nuxt/schema";

import { ThemeMode } from "../app/models/vuetify/ThemeMode";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    enableRules: true,
    prefixComposables: true,
    rulesConfiguration: {
      configFile: "@/rules.config.ts",
    },
    // Vuetify resolves ThemeMode.system through a matchMedia ref that only exists in the browser, so without
    // The hint the server always renders v-theme--light and every themed class mismatches on hydration. The
    // Header carries the browser's scheme into SSR (chromium), and the module mirrors it into a cookie that
    // Every other browser gets from the second request on — NuxtTheme reads it as colorSchemeFromCookie.
    // Off under Vitest, like the module allowlist in configuration/modules.ts: the hints plugins want a real
    // Request and SSR payload, and without one the client plugin never settles, hanging every mountSuspended.
    // The no-hints plugin still provides $ssrClientHints, so NuxtTheme just falls back to the default theme.
    ...(process.env.VITEST
      ? {}
      : {
          ssrClientHints: {
            prefersColorScheme: true,
            prefersColorSchemeOptions: { darkThemeName: ThemeMode.dark, lightThemeName: ThemeMode.light },
          },
        }),
    styles: {
      configFile: "@/assets/css/settings.scss",
    },
  },
};
