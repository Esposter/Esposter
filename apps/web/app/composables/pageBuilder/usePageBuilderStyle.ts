import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { MaybeRefOrGetter } from "vue";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { DEVICE_BREAKPOINT_MAP } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getStyleInheritance } from "@/services/pageBuilder/getStyleInheritance";
import { setStyleProperty } from "@/services/pageBuilder/setStyleProperty";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { JsonPatchOperationType, noop } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// The style of the selected node at the breakpoint the device edits and the state the style panel edits, one edit per
// Field and state, so typing a value merges into one history entry and a reset is an entry of its own
export const usePageBuilderStyle = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getDevice, getSelectedNodeId, getStyleState } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const target = computed(() => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    if (!document) return undefined;

    const pointer = getNodePointer(document, getSelectedNodeId(resourceIdValue));
    if (pointer === undefined) return undefined;

    const node = getBlockNode(document, pointer, webpageNodeChildren);
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
  const setField = (property: StyleProperty, value: string) => {
    const resourceIdValue = toValue(resourceId);
    const targetValue = target.value;
    if (!targetValue) return;

    const breakpoint = getBreakpoint();
    const state = getState();
    applyEdit(
      resourceIdValue,
      [
        {
          op: JsonPatchOperationType.Add,
          path: `${targetValue.pointer}/props/style`,
          value: setStyleProperty(targetValue.style, breakpoint, state, property, value),
        },
      ],
      value === "" ? "Reset style" : "Edit style",
      value === "" ? undefined : `style:${targetValue.nodeId}:${breakpoint}:${state}:${property}`,
    ).match(noop, console.error);
  };
  const resetField = (property: StyleProperty) => {
    setField(property, "");
  };

  return { getField, hasNode: computed(() => target.value !== undefined), resetField, setField };
};
