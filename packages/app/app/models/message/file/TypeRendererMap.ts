import type { Component } from "vue";

import { Mimetype } from "#shared/models/file/Mimetype";

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Image.vue")),
  [Mimetype[".pdf"]]: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Pdf.vue")),
  video: defineAsyncComponent(() => import("@/components/Message/FileRenderer/Video.vue")),
};
