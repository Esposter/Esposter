import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { MaybeRefOrGetter } from "vue";
import type { z } from "zod";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { checkIsDeepEqual, JsonPatchOperationType, noop } from "@esposter/shared";
import { getBlockNode, getBlockTypeDefinition } from "headless-block-editor";

// The pointer and history interaction of the root, whose props are edited when no node is selected
const ROOT_POINTER = "/root";
const ROOT_INTERACTION_ID = "content:root";

// The props a form edits: the root's, or a node's own props as its type's props schema parses them
type ContentValue = WebpageRootProps | z.output<WebpageNodeDefinition["propsSchema"]>;

interface ContentTarget {
  formSchema: z.ZodType;
  interactionId: string;
  pointer: string;
  // The props the target holds in full, which an edit writes back whole so the slots and the id it keeps are untouched
  props: WebpageNode["props"] | WebpageRootProps;
  propsSchema: z.ZodType<ContentValue>;
}

// The target a selection edits: the selected node, or the root when nothing is selected or the id is not found.
// The target is undefined when the node's type is not in the registry
const getContentTarget = (document: WebpageDocument, nodeId: string): ContentTarget | undefined => {
  const nodePointer = getNodePointer(document, nodeId);
  if (nodePointer === undefined)
    return {
      formSchema: webpageRootPropsSchema,
      interactionId: ROOT_INTERACTION_ID,
      pointer: ROOT_POINTER,
      props: document.root.props,
      propsSchema: webpageRootPropsSchema,
    };

  const node = getBlockNode(document, nodePointer);
  const definition = node && getBlockTypeDefinition(webpageRegistry, node.type);
  if (!node || !definition) return undefined;

  return {
    formSchema: definition.formSchema,
    interactionId: `content:${nodeId}`,
    pointer: nodePointer,
    props: node.props,
    propsSchema: definition.propsSchema,
  };
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
  const savedValue = computed(() => {
    const currentTarget = target.value;
    if (!currentTarget) return undefined;

    const result = currentTarget.propsSchema.safeParse(currentTarget.props);
    return result.success ? result.data : undefined;
  });
  // The value the form shows, which keeps an invalid value the user typed until the document changes
  const draftValue = ref(savedValue.value);
  watch(savedValue, (value) => {
    draftValue.value = value;
  });
  const setFormValue = (value: ContentValue) => {
    draftValue.value = value;
    const currentTarget = target.value;
    if (!currentTarget || checkIsDeepEqual(value, savedValue.value)) return;
    if (!currentTarget.propsSchema.safeParse(value).success) return;

    applyEdit(
      toValue(resourceId),
      [
        {
          op: JsonPatchOperationType.Replace,
          path: `${currentTarget.pointer}/props`,
          value: { ...currentTarget.props, ...value },
        },
      ],
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
    validationSchema: computed(() => target.value?.propsSchema),
  };
};
