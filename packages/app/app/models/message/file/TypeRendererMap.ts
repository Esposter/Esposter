import type { Component } from "vue";

export const TypeRendererMap: Record<string, Component> = {
  "application/pdf": defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Pdf.vue")),
  audio: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Image.vue")),
  video: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Video.vue")),
};
