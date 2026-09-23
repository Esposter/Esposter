import { READABLE_TEXT_COOKIE_NAME } from "@/services/ui/constants";
import { THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";

// Whether body text is in the system's own face rather than the pixel one. A cookie, as the theme is, so the first
// Response already renders the reader's choice, and a reader signed out has it too
export const useReadableTextStore = defineStore("ui/readableText", () => {
  const isReadableText = useCookie(READABLE_TEXT_COOKIE_NAME, { ...THEME_COOKIE_OPTIONS, default: () => false });
  const toggleReadableText = () => {
    isReadableText.value = !isReadableText.value;
  };
  return { isReadableText, toggleReadableText };
});
