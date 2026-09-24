import { UI_STYLE_INJECTION_KEY } from "@/services/ui/constants";
import { DEFAULT_UI_STYLE } from "@@/configuration/UiStyleMap";

// The style the nearest theme scope draws in, or the reader's, which `NuxtTheme` provides around the whole app.
// Positional, so it is the library's one provide and inject rather than a store read: a region pinned to a style keeps
// It for everything in it, and a component mounted on its own draws in the default
export const useUiStyle = () =>
  inject(
    UI_STYLE_INJECTION_KEY,
    toRef(() => DEFAULT_UI_STYLE),
  );
