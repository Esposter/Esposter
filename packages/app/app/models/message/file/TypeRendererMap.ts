import type { Component } from "vue";

export const TypeRendererMap: Record<string, Component> = {
  "application/pdf": defineAsyncComponent(() => import("@/components/Message/FileRenderer/Pdf.vue")),
  audio: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Image.vue")),
  video: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Video.vue")),
};
