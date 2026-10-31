import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";

import { DEVICE_BREAKPOINT_MAP } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getStyleInheritance } from "@/services/pageBuilder/getStyleInheritance";
import { getStyleOperations } from "@/services/pageBuilder/getStyleOperations";
import { setStyleProperty } from "@/services/pageBuilder/setStyleProperty";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { usePageBuilderStyleClipboardStore } from "@/store/pageBuilder/styleClipboard";
import { noop } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// What one field edit writes: the operations, and the history entry they record as
type FieldEdit = Pick<PageBuilderHistoryEntry, "interactionId" | "label" | "operations">;
// The style of the selected node at the breakpoint the device edits and the state the style panel edits. A field's edit
// Merges into one history entry per field, state and breakpoint, and a reset is an entry of its own
export const usePageBuilderStyle = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getOpenDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getDevice, getSelectedNodeId, getStyleState } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit, setPreview } = pageBuilderHistoryStore;
  // The store is read through its object, since destructuring would keep the copied style as it was when this ran
  const pageBuilderStyleClipboardStore = usePageBuilderStyleClipboardStore();
  const target = computed(() => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument(resourceIdValue);
    if (!open) return undefined;

    const { document, kind } = open;
    const pointer = getNodePointer(kind, document, getSelectedNodeId(resourceIdValue));
    if (pointer === undefined) return undefined;

    const node = getBlockNode(document, pointer, kind.children);
    return node && { nodeId: node.props.id, pointer, style: node.props.style };
  });
  const getBreakpoint = () => DEVICE_BREAKPOINT_MAP[getDevice(toValue(resourceId))];
  const getState = () => getStyleState(toValue(resourceId));
  // The value the field sets at the active breakpoint and state, and the value it inherits there as a placeholder
  const getField = (property: StyleProperty) => {
    const targetValue = target.value;
    const breakpoint = getBreakpoint();
    const state = getState();
    const inheritance = getStyleInheritance(targetValue?.style ?? {}, breakpoint, state, property);
    return {
      inheritedValue: inheritance?.value,
      placeholder: inheritance ? `${inheritance.value}, from ${inheritance.from}` : undefined,
      value: targetValue?.style?.[breakpoint]?.[state]?.[property] ?? "",
    };
  };
  // The edit that writes a field's value, shared by a commit and a preview so the two never disagree about what is written
  const getFieldEdit = (property: StyleProperty, value: string): FieldEdit | undefined => {
    const targetValue = target.value;
    if (!targetValue) return undefined;

    const breakpoint = getBreakpoint();
    const state = getState();
    const operations = getStyleOperations(
      targetValue.pointer,
      targetValue.style,
      setStyleProperty(targetValue.style, breakpoint, state, property, value),
    );
    // A reset of a field the node never set changes nothing, so it records no edit
    if (operations.length === 0) return undefined;

    return {
      interactionId: value === "" ? undefined : `style:${targetValue.nodeId}:${breakpoint}:${state}:${property}`,
      label: value === "" ? "Reset style" : "Edit style",
      operations,
    };
  };
  const setField = (property: StyleProperty, value: string) => {
    const edit = getFieldEdit(property, value);
    if (!edit) return;

    applyEdit(toValue(resourceId), edit.operations, edit.label, edit.interactionId).match(noop, console.error);
  };
  // A value a drag is passing through: drawn on the canvas at once, and recorded only when the drag settles via setField
  const previewField = (property: StyleProperty, value: string) => {
    const edit = getFieldEdit(property, value);
    if (edit) setPreview(toValue(resourceId), edit.operations);
  };
  const resetField = (property: StyleProperty) => {
    setField(property, "");
  };
  // Copy takes the selected node's whole style, and paste replaces the selected node's style with the copied one, so the
  // Two nodes match after it. The copied style is shared, never mutated, since every edit above writes a new style
  const copyStyle = () => {
    const targetValue = target.value;
    if (targetValue) pageBuilderStyleClipboardStore.setCopiedStyle(targetValue.style ?? {});
  };
  const pasteStyle = () => {
    const targetValue = target.value;
    const { copiedStyle } = pageBuilderStyleClipboardStore;
    if (!targetValue || !copiedStyle) return;

    const operations = getStyleOperations(targetValue.pointer, targetValue.style, copiedStyle);
    if (operations.length === 0) return;

    applyEdit(toValue(resourceId), operations, "Paste style").match(noop, console.error);
  };

  return {
    copyStyle,
    getField,
    hasNode: computed(() => target.value !== undefined),
    pasteStyle,
    previewField,
    resetField,
    setField,
  };
};
