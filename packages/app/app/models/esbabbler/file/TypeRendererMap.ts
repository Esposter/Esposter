import type { Component } from "vue";

import { Mimetype } from "@/models/file/Mimetype";

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Image.vue")),
  [Mimetype[".pdf"]]: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Pdf.vue")),
  video: defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Video.vue")),
};
