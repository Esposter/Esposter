import type { EmailStyleField } from "@/models/pageBuilder/EmailStyleField";

import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { getEmailAttributeValue } from "#shared/services/pageBuilder/email/getEmailAttributeValue";
import { getEmailAttributeOperation } from "@/services/pageBuilder/email/getEmailAttributeOperation";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { noop } from "@esposter/shared";
import { getBlockNode, getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";
import { getMjmlAttributeFields } from "mjml-blocks";

// The style fields of the selected email node: one per attribute its type takes. A field holds the value the node sets,
// And shows the cascade's value as its placeholder, so clearing a field restores what the root or MJML gives it
export const useEmailStyle = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getEmailDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const target = computed(() => {
    const resourceIdValue = toValue(resourceId);
    const document = getEmailDocument(resourceIdValue);
    if (!document) return undefined;

    const pointer = getNodePointer(emailKind, document, getSelectedNodeId(resourceIdValue));
    if (pointer === undefined) return undefined;

    const node = getBlockNode(document, pointer, emailKind.children);
    return node && { node, pointer, rootAttributes: document.root.props.attributes };
  });
  const fields = computed(() => {
    const selectedTarget = target.value;
    const definition = selectedTarget && getBlockTypeDefinition(emailRegistry, selectedTarget.node.type);
    if (!selectedTarget || !definition) return [];

    return getMjmlAttributeFields(definition).map(({ name, type }): EmailStyleField => {
      const own = getBlockPropValue(selectedTarget.node.props, name);
      const isSet = typeof own === "string";
      return {
        isSet,
        name,
        placeholder: getEmailAttributeValue(selectedTarget.node, name, selectedTarget.rootAttributes) ?? "",
        type,
        value: isSet ? own : "",
      };
    });
  });
  const setField = (attribute: string, value: string) => {
    const selectedTarget = target.value;
    // Clearing a field the node never set has nothing to remove, so it records no edit
    if (!selectedTarget || (value === "" && getBlockPropValue(selectedTarget.node.props, attribute) === undefined))
      return;

    applyEdit(
      toValue(resourceId),
      [getEmailAttributeOperation(selectedTarget.pointer, attribute, value)],
      value === "" ? "Reset style" : "Edit style",
      value === "" ? undefined : `email-style:${selectedTarget.node.props.id}:${attribute}`,
    ).match(noop, console.error);
  };

  return { fields, hasNode: computed(() => target.value !== undefined), setField };
};
