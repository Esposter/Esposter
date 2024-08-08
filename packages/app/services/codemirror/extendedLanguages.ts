import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

export const extendedLanguages = languages.concat(
  LanguageDescription.of({
    extensions: ["vue"],
    load: () => import("@codemirror/lang-vue").then(({ vue }) => vue()),
    name: "Vue",
  }),
);
