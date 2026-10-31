import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition, OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { ROOT_INTERACTION_ID, ROOT_POINTER } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { checkIsDeepEqual, JsonPatchOperationType, noop } from "@esposter/shared";
import { getBlockNode, getBlockTypeDefinition } from "headless-block-editor";

interface ContentTarget<TValue, TProps> {
  formSchema: z.ZodType;
  interactionId: string;
  pointer: string;
  // The props the target holds in full, which an edit writes back whole so the slots and the id it keeps are untouched
  props: TProps;
  propsSchema: z.ZodType<TValue>;
}
// The props the form edits: the root's, or a node's own props as its type's props schema parses them
type ContentValue<TNode extends BlockNode, TRoot extends BlockRootProps> = OwnProps<TNode["props"]> | TRoot;
// The target a selection edits: the selected node, or the root when nothing is selected or the id is not found.
// The target is undefined when the node's type is not in the registry
const getContentTarget = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode> & { formSchema: z.ZodType },
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  nodeId: string,
): ContentTarget<ContentValue<TNode, TRoot>, TNode["props"] | TRoot> | undefined => {
  const nodePointer = getNodePointer(kind, document, nodeId);
  if (nodePointer === undefined)
    return {
      formSchema: kind.rootFormSchema,
      interactionId: ROOT_INTERACTION_ID,
      pointer: ROOT_POINTER,
      props: document.root.props,
      propsSchema: kind.registry.root.propsSchema,
    };

  const node = getBlockNode(document, nodePointer, kind.children);
  const definition = node && getBlockTypeDefinition(kind.registry, node.type);
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
export const usePageBuilderContent = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode> & { formSchema: z.ZodType },
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
) => {
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const target = computed(() => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument();
    return document && getContentTarget(kind, document, getSelectedNodeId(resourceIdValue));
  });
  // The form's value as the document holds it, which the form's draft follows whenever the document changes
  const savedValue = computed(() => {
    const targetValue = target.value;
    if (!targetValue) return undefined;

    const result = targetValue.propsSchema.safeParse(targetValue.props);
    return result.success ? result.data : undefined;
  });
  // The value the form shows, which keeps an invalid value the user typed until the document changes
  const draftValue = ref(savedValue.value);
  watch(savedValue, (value) => {
    draftValue.value = value;
  });
  const setFormValue = (value: ContentValue<TNode, TRoot>) => {
    draftValue.value = value;
    const targetValue = target.value;
    if (!targetValue || checkIsDeepEqual(value, savedValue.value)) return;
    if (!targetValue.propsSchema.safeParse(value).success) return;

    applyEdit(
      toValue(resourceId),
      [
        {
          op: JsonPatchOperationType.Replace,
          path: `${targetValue.pointer}/props`,
          value: { ...targetValue.props, ...value },
        },
      ],
      "Edit block",
      targetValue.interactionId,
    ).match(noop, console.error);
  };
  return {
    formSchema: computed(() => target.value?.formSchema),
    formValue: draftValue,
    pointer: computed(() => target.value?.pointer),
    setFormValue,
    validationSchema: computed(() => target.value?.propsSchema),
  };
};
