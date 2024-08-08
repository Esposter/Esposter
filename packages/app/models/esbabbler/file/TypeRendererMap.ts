import type { Component } from "vue";

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Image.vue")),
  video: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Video.vue")),
};
