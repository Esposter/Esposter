import { languages } from "@codemirror/language-data";
import type { Component } from "vue";

const getLanguageRegexSupportPattern = (extensions: readonly string[]) => `^.*\\.(${extensions.join("|")})$`;

export const LanguageRegexSupportMap = languages.reduce<Record<string, string>>((acc, curr) => {
  acc[curr.name] = getLanguageRegexSupportPattern(curr.extensions);
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
