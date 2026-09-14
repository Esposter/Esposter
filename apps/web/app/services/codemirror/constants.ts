import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

// `@codemirror/language-data` ships no Vue entry, so the one the app needs most is appended here
export const EXTENDED_LANGUAGES = [
  ...languages,
  LanguageDescription.of({
    extensions: ["vue"],
    load: async () => {
      const { vue } = await import("@codemirror/lang-vue");
      return vue();
    },
    name: "Vue",
  }),
];
