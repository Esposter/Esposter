import type { Component } from "vue";

import { MimeType } from "#shared/models/file/MimeType";

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Image.vue")),
  [MimeType.Pdf]: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Pdf.vue")),
  video: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Video.vue")),
};
