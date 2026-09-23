import { UiTheme } from "@/models/ui/UiTheme";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { createHydrationPlugin, createThemePlugin } from "@vuetify/v0";
import { V0UnheadThemeAdapter } from "@vuetify/v0/theme/adapters/unhead";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createHydrationPlugin());
  nuxtApp.vueApp.use(
    createThemePlugin({
      // Unhead renders the token stylesheet and the root's `data-theme` into the first response, where the default
      // Adapter writes adopted stylesheets that exist only in the browser. `NuxtTheme` selects the resolved theme
      // During the server render, and the adapter's own watcher patches the head entry before it is serialised
      adapter: new V0UnheadThemeAdapter({ prefix: "ui" }),
      default: UiTheme.Dusk,
      // Only the root's attribute, through Unhead, carries the theme. Without a target the adapter also writes the
      // Default onto the body the moment the plugin installs, before `NuxtTheme` selects, and the body's attribute
      // Overrides the root's — so a page served in dawn repainted in dusk until hydration settled
      target: null,
      themes: {
        [UiTheme.Dawn]: { colors: UiPaletteMap[UiTheme.Dawn], dark: false },
        [UiTheme.Dusk]: { colors: UiPaletteMap[UiTheme.Dusk], dark: true },
      },
    }),
  );
});
