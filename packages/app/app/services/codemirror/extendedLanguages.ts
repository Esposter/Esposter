import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

export const extendedLanguages = languages.concat(
  LanguageDescription.of({
    extensions: ["vue"],
    load: async () => {
      const { vue } = await import("@codemirror/lang-vue");
      return vue();
    },
    name: "Vue",
  }),
);
