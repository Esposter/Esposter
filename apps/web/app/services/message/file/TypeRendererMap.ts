import { MimeType } from "#shared/models/file/MimeType";

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("#src/components/Message/Model/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("#src/components/Message/Model/FileRenderer/Image.vue")),
  [MimeType.Pdf]: defineAsyncComponent(() => import("#src/components/Message/Model/FileRenderer/Pdf.vue")),
  video: defineAsyncComponent(() => import("#src/components/Message/Model/FileRenderer/Video.vue")),
};
