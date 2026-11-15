import { ResolvedThemeModes } from "@/models/ui/ResolvedThemeMode";
import { ThemeMode } from "@/models/ui/ThemeMode";
import { UiStyles } from "@/models/ui/UiStyle";
import { BREAKPOINTS_NAMESPACE } from "@/services/ui/constants";
import { getUiTheme } from "@/services/ui/getUiTheme";
import { BREAKPOINTS } from "@@/configuration/breakpoints";
import { DEFAULT_UI_STYLE } from "@@/configuration/constants";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { createBreakpointsPlugin, createHydrationPlugin, createThemePlugin, useBreakpoints } from "@vuetify/v0";
import { V0UnheadThemeAdapter } from "@vuetify/v0/theme/adapters/unhead";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createHydrationPlugin());
  // The same widths UnoCSS's variants read; below the large one is a narrow screen, where drawers become sheets. The
  // Server has no screen, so both renders start at no width and hydrate alike. The plugin measures as the app mounts,
  // Through a wrapper around `mount`, and a server-rendered page hydrates a lazily loaded layout or page after that, so
  // A wide screen hydrated its drawers as docked columns over the server's sheets. For a server-rendered page the
  // Wrapper is set aside and the measure waits for the root suspense to resolve; any other mount keeps it
  const { mount } = nuxtApp.vueApp;
  nuxtApp.vueApp.use(
    createBreakpointsPlugin({
      breakpoints: BREAKPOINTS,
      mobileBreakpoint: "lg",
      namespace: BREAKPOINTS_NAMESPACE,
      ssr: { clientWidth: 0 },
    }),
  );
  if (nuxtApp.payload.serverRendered) {
    nuxtApp.vueApp.mount = mount;
    nuxtApp.hooks.hookOnce("app:suspense:resolve", () => {
      useBreakpoints(BREAKPOINTS_NAMESPACE).update();
    });
  }
  nuxtApp.vueApp.use(
    createThemePlugin({
      // Unhead renders the token stylesheet and the root's `data-theme` into the first response, where the default
      // Adapter writes adopted stylesheets that exist only in the browser. `NuxtTheme` selects the resolved theme
      // During the server render, and the adapter's own watcher patches the head entry before it is serialised
      adapter: new V0UnheadThemeAdapter({ prefix: "ui" }),
      default: getUiTheme(DEFAULT_UI_STYLE, ThemeMode.Dark),
      // Only the root's attribute, through Unhead, carries the theme. Without a target the adapter also writes the
      // Default onto the body the moment the plugin installs, before `NuxtTheme` selects, and the body's attribute
      // Overrides the root's — so a page served in dawn repainted in dusk until hydration settled
      target: null,
      // One theme for each design style in each mode, so a scope can pin a style as well as a mode
      themes: Object.fromEntries(
        UiStyles.flatMap((uiStyle) =>
          ResolvedThemeModes.map((themeMode) => [
            getUiTheme(uiStyle, themeMode),
            { colors: UiPaletteMap[uiStyle][themeMode], dark: themeMode === ThemeMode.Dark },
          ]),
        ),
      ),
    }),
  );
});
