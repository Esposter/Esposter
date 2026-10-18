// @vitest-environment nuxt
import type { JsonPatchOperation } from "@esposter/shared";
import type { BlockDocument } from "headless-block-editor";

import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { InvalidOperationError, JsonPatchOperationType, Operation } from "@esposter/shared";
import { applyBlockEdit, moveBlockNode, updateBlockNodeProps } from "headless-block-editor";
import { describe, expect, test, vi } from "vitest";

const insertAtFirstIndex = (id: string): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Add, path: "/content/1", value: createButton(id) },
];

describe(usePageBuilderHistoryStore, () => {
  const TEST_DOCUMENT: BlockDocument = {
    content: [createButton(TEST_ID), createButton(TEST_OTHER_ID)],
    root: TEST_ROOT,
  };
  const TEST_MOVE_LABEL = "Move block";
  const TEST_LABEL_LABEL = "Change label";
  const setupDocument = async () => {
    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { loadDocument } = pageBuilderDocumentStore;
    await loadDocument(resourceId, () => Promise.resolve(TEST_DOCUMENT));
    return resourceId;
  };
  const moveFirstToEnd = () => moveBlockNode(TEST_DOCUMENT, webpageRegistry, "/content/0", "/content", 1);

  test("undo restores the document before the last edit", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL)._unsafeUnwrap();
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
  });

  test("a drag of a value is one undo entry", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    for (let step = 0; step < 10; step += 1)
      applyEdit(
        resourceId,
        updateBlockNodeProps("/content/0", { label: `${step}` }),
        TEST_LABEL_LABEL,
        interactionId,
      )._unsafeUnwrap();
    const undoLabelBeforeUndo = getUndoLabel(resourceId);
    undo(resourceId);

    expect(undoLabelBeforeUndo).toBe(TEST_LABEL_LABEL);
    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("two inserts at one index in one interaction are two undo entries", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, insertAtFirstIndex("c"), TEST_MOVE_LABEL, interactionId)._unsafeUnwrap();
    applyEdit(resourceId, insertAtFirstIndex("d"), TEST_MOVE_LABEL, interactionId)._unsafeUnwrap();
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({
      content: [createButton(TEST_ID), createButton("c"), createButton(TEST_OTHER_ID)],
      root: TEST_ROOT,
    });

    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
  });

  test("undo stops at the oldest kept entry", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const editCount = MAX_PAGE_BUILDER_HISTORY_SIZE + 1;
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    for (let edit = 0; edit < editCount; edit += 1)
      applyEdit(resourceId, updateBlockNodeProps("/content/0", { label: `${edit}` }), TEST_LABEL_LABEL)._unsafeUnwrap();
    for (let attempt = 0; attempt < editCount; attempt += 1) undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(
      applyBlockEdit(TEST_DOCUMENT, updateBlockNodeProps("/content/0", { label: "0" }))._unsafeUnwrap().document,
    );
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("redo reapplies an undone edit", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL)._unsafeUnwrap();
    const movedDocument = getDocument(resourceId);
    undo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(movedDocument);
  });

  test("a new edit after undo discards the redo entry", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getRedoLabel, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL)._unsafeUnwrap();
    undo(resourceId);
    const redoLabelAfterUndo = getRedoLabel(resourceId);
    applyEdit(resourceId, updateBlockNodeProps("/content/0", { label: "" }), TEST_LABEL_LABEL)._unsafeUnwrap();
    const editedDocument = getDocument(resourceId);
    redo(resourceId);

    expect(redoLabelAfterUndo).toBe(TEST_MOVE_LABEL);
    expect(getRedoLabel(resourceId)).toBe("");
    expect(getDocument(resourceId)).toStrictEqual(editedDocument);
  });

  test("reloading a document leaves nothing to undo", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, clearHistory, getUndoLabel, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, updateBlockNodeProps("/content/0", { label: "" }), TEST_LABEL_LABEL)._unsafeUnwrap();
    const editedDocument = getDocument(resourceId);
    clearHistory(resourceId);
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(editedDocument);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("a save stores the whole document after edits", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, saveDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL)._unsafeUnwrap();
    applyEdit(resourceId, updateBlockNodeProps("/content/0", { label: "" }), TEST_LABEL_LABEL)._unsafeUnwrap();
    const editedDocument = getDocument(resourceId);
    const writeDocument = vi.fn<(document: BlockDocument) => Promise<void>>().mockResolvedValue(undefined);
    await saveDocument(resourceId, writeDocument);

    expect(writeDocument).toHaveBeenCalledExactlyOnceWith(editedDocument);
  });

  test("an edit whose operations cannot apply changes neither the document nor the history", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel } = pageBuilderHistoryStore;
    const result = applyEdit(resourceId, updateBlockNodeProps("/content/9", { label: "" }), TEST_LABEL_LABEL);

    expect(result._unsafeUnwrapErr()).toStrictEqual(
      new InvalidOperationError(Operation.Read, "/content/9/props", "no such member"),
    );
    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("an edit in the same interaction over a different path starts a new entry", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      updateBlockNodeProps("/content/0", { label: "" }),
      TEST_LABEL_LABEL,
      interactionId,
    )._unsafeUnwrap();
    const labelEditedDocument = getDocument(resourceId);
    applyEdit(
      resourceId,
      updateBlockNodeProps("/content/0", { href: "" }),
      "Change link",
      interactionId,
    )._unsafeUnwrap();
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(labelEditedDocument);
  });

  test("an insert and a replace of its path in one interaction stay two entries, and redo restores both", async () => {
    expect.hasAssertions();

    const resourceId = await setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, insertAtFirstIndex("c"), TEST_MOVE_LABEL, interactionId)._unsafeUnwrap();
    applyEdit(
      resourceId,
      [{ op: JsonPatchOperationType.Replace, path: "/content/1", value: createButton("d") }],
      TEST_LABEL_LABEL,
      interactionId,
    )._unsafeUnwrap();
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({
      content: [createButton(TEST_ID), createButton("c"), createButton(TEST_OTHER_ID)],
      root: TEST_ROOT,
    });

    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);

    redo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({
      content: [createButton(TEST_ID), createButton("d"), createButton(TEST_OTHER_ID)],
      root: TEST_ROOT,
    });
  });
});
