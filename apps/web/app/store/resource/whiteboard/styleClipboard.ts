import type { PositionedElementProperty } from "vue-block-editor-headless";

// The look last copied from an element, held across every open whiteboard so a look copied on one pastes onto another in the session. Nothing copied
// Is an empty look, which a paste applies as no change
export const useWhiteboardStyleClipboardStore = defineStore("resource/whiteboard/styleClipboard", () => {
  const copiedStyle = shallowRef<PositionedElementProperty[]>([]);
  const setCopiedStyle = (style: PositionedElementProperty[]) => {
    copiedStyle.value = style;
  };
  return { copiedStyle, setCopiedStyle };
});
