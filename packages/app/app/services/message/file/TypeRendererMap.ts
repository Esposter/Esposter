import { MimeType } from "#shared/models/file/MimeType";

// Every renderer a file can resolve to, declared here rather than half here and half inline in the component that
// Resolves them. The two below are not keyed by mimetype — Code wins on the filename's language and Default is the
// Fallback when nothing matches — but they are still renderers, and a reader asking "what can a file render as?"
// Should not have to read the resolver to find two of the answers.
export const CodeRenderer = defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Code.vue"));
export const DefaultRenderer = defineAsyncComponent(
  () => import("@/components/Message/Model/FileRenderer/Default.vue"),
);

export const TypeRendererMap: Record<string, Component> = {
  audio: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Audio.vue")),
  image: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Image.vue")),
  [MimeType.Pdf]: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Pdf.vue")),
  video: defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Video.vue")),
};
