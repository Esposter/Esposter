import { uiStyleSchema } from "@/models/ui/UiStyle";
import { UI_STYLE_COOKIE_NAME } from "@/services/ui/constants";
import { THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";
import { DEFAULT_UI_STYLE } from "@@/configuration/UiStyleMap";

// The reader's design style. A cookie, as the theme is, so the first response already renders it and a reader signed
// Out has one too; a value no style answers to any more, or one written by hand, reads as the default
export const useUiStyleStore = defineStore("ui/style", () => {
  const uiStyle = useCookie(UI_STYLE_COOKIE_NAME, {
    ...THEME_COOKIE_OPTIONS,
    decode: (value) => uiStyleSchema.safeParse(value).data ?? DEFAULT_UI_STYLE,
    default: () => DEFAULT_UI_STYLE,
  });
  return { uiStyle };
});
