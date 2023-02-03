import type { Component } from "vue";

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
