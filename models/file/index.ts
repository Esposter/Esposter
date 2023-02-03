import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { escapeRegExp } from "@unocss/core";
import type { Component } from "vue";

export const extendedLanguages = languages.concat(
  LanguageDescription.of({
    name: "Vue",
    extensions: ["vue"],
    load: () => import("@codemirror/lang-vue").then((m) => m.vue()),
  })
);

const getLanguageRegexSupportPattern = (supportedExtensions: string) =>
  /\^/.test(supportedExtensions)
    ? supportedExtensions.replace(/\|(\^)?/g, (_, b) => `$|${b ? "^" : "^.*\\."}$`)
    : `^.*\\.(${supportedExtensions})$`;

export const LanguageRegexSupportMap = extendedLanguages.reduce<Record<string, string>>((acc, curr) => {
  acc[curr.name] = getLanguageRegexSupportPattern(curr.extensions.map((ext) => escapeRegExp(ext)).join("|"));
  return acc;
}, {});
export type LanguageRegexSupportMap = typeof LanguageRegexSupportMap;

export interface FileRendererProps {
  url: string;
  mimetype: string;
  preview?: true;
}

export const typeRendererMap: Record<string, Component> = {
  image: defineAsyncComponent(() => import("@/components/File/ImageRenderer.vue")),
  video: defineAsyncComponent(() => import("@/components/File/VideoRenderer.vue")),
  audio: defineAsyncComponent(() => import("@/components/File/AudioRenderer.vue")),
};
