import type { BlockDocument } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";
import type { z } from "zod";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { getNodePointerById } from "@/services/pageBuilder/getNodePointerById";
import { checkIsDeepEqual, noop } from "@esposter/shared";
import { getBlockNode, getBlockTypeDefinition, updateBlockNodeProps } from "headless-block-editor";

// The pointer and history interaction of the root, whose props are edited when no node is selected
const ROOT_POINTER = "/root";
const ROOT_INTERACTION_ID = "content:root";

interface ContentTarget {
  formSchema: z.ZodType;
  interactionId: string;
  pointer: string;
  props: Record<string, unknown>;
}

// The target a selection edits: the selected node, or the root when nothing is selected or the id is not found.
// The target is undefined when the node's type is not in the registry
const getContentTarget = (document: BlockDocument, nodeId: string): ContentTarget | undefined => {
  const nodePointer = getNodePointerById(document, nodeId);
  if (nodePointer === undefined)
    return {
      formSchema: webpageRootPropsSchema,
      interactionId: ROOT_INTERACTION_ID,
      pointer: ROOT_POINTER,
      props: document.root.props,
    };

  const node = getBlockNode(document, nodePointer);
  const definition = node && getBlockTypeDefinition(webpageRegistry, node.type);
  if (!node || !definition) return undefined;

  return {
    formSchema: definition.formSchema,
    interactionId: `content:${nodeId}`,
    pointer: nodePointer,
    props: node.props,
  };
};

// The props a form edits: those of the form's schema, so the id and the style are never shown or changed by the form
const getFormValue = (props: Record<string, unknown>, formSchema: z.ZodType) => {
  const formKeys = Object.keys(zodToJsonSchema(formSchema).properties ?? {});
  return Object.fromEntries(formKeys.filter((key) => key in props).map((key) => [key, props[key]]));
};

// The form of the selected node's content, edited through the page builder's history: a value that is not valid is
// Shown by the form but not applied, and a value applies as one edit of the props it changes
export const usePageBuilderContent = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const target = computed(() => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    return document && getContentTarget(document, getSelectedNodeId(resourceIdValue));
  });
  // The form's value as the document holds it, which the form's draft follows whenever the document changes
  const savedValue = computed(() => target.value && getFormValue(target.value.props, target.value.formSchema));
  // The value the form shows, which keeps an invalid value the user typed until the document changes
  const draftValue = ref(savedValue.value);
  watch(savedValue, (value) => {
    draftValue.value = value;
  });
  const setFormValue = (value: Record<string, unknown>) => {
    draftValue.value = value;
    const currentTarget = target.value;
    if (!currentTarget) return;

    const current = getFormValue(currentTarget.props, currentTarget.formSchema);
    const changedProps = Object.fromEntries(
      Object.entries(value).filter(([key, propValue]) => !checkIsDeepEqual(propValue, current[key])),
    );
    if (Object.keys(changedProps).length === 0) return;
    if (!currentTarget.formSchema.safeParse(value).success) return;

    applyEdit(
      toValue(resourceId),
      updateBlockNodeProps(currentTarget.pointer, changedProps),
      "Edit block",
      currentTarget.interactionId,
    ).match(noop, console.error);
  };
  const formSchema = computed(() => target.value?.formSchema);

  return {
    formSchema,
    formValue: draftValue,
    pointer: computed(() => target.value?.pointer),
    setFormValue,
    validationSchema: formSchema,
  };
};
