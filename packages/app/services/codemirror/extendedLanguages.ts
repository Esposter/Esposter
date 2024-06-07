import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

export const extendedLanguages = languages.concat(
  LanguageDescription.of({
    name: "Vue",
    extensions: ["vue"],
    load: () => import("@codemirror/lang-vue").then(({ vue }) => vue()),
  }),
);
