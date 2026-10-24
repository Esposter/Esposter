import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";

// The style last copied from a node, held across every open resource so a copied style pastes into another webpage too
export const usePageBuilderStyleClipboardStore = defineStore("pageBuilder/styleClipboard", () => {
  const copiedStyle = shallowRef<NodeStyle>();
  const setCopiedStyle = (style: NodeStyle) => {
    copiedStyle.value = style;
  };
  return { copiedStyle, setCopiedStyle };
});
