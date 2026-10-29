// @vitest-environment nuxt
import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";
import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { InvalidOperationError, JsonPatchOperationType, noop, Operation } from "@esposter/shared";
import { applyBlockEdit, moveBlockNode, updateBlockNodeProps } from "headless-block-editor";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test, vi } from "vitest";

const insertAtFirstIndex = (id: string): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Add, path: "/content/1", value: createButton(id) },
];

describe(usePageBuilderHistoryStore, () => {
  const TEST_DOCUMENT: WebpageDocument = {
    content: [createButton(TEST_ID), createButton(TEST_OTHER_ID)],
    root: TEST_ROOT,
  };
  const TEST_C_INSERTED_DOCUMENT: WebpageDocument = {
    content: [createButton(TEST_ID), createButton(TEST_THIRD_ID), createButton(TEST_OTHER_ID)],
    root: TEST_ROOT,
  };
  const TEST_MOVE_LABEL = "Move block";
  const TEST_LABEL_LABEL = "Change label";
  const TEST_TEXT_LABEL = "Edit text";
  const TEST_OTHER_LANG = "fr";
  // Values an edit writes over a button's label and link, each different from the one the fixture holds
  const TEST_EDITED_LABEL = "Edited";
  const TEST_EDITED_URL = "https://example.com/edited";
  const setupDocument = () => {
    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, TEST_DOCUMENT);
    return resourceId;
  };
  const moveFirstToEnd = () =>
    moveBlockNode(TEST_DOCUMENT, webpageRegistry, webpageNodeChildren, "/content/0", "/content", 1);

  test("undo restores the document before the last edit", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
  });

  test("a drag of a value is one undo entry", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    for (let step = 0; step < 10; step += 1)
      applyEdit(
        resourceId,
        updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: `${step}` }),
        TEST_LABEL_LABEL,
        interactionId,
      ).match(noop, (error) => {
        throw error;
      });
    const undoLabelBeforeUndo = getUndoLabel(resourceId);
    undo(resourceId);

    expect(undoLabelBeforeUndo).toBe(TEST_LABEL_LABEL);
    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("a text session is one undoable change", () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const textDocument: WebpageDocument = {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, textDocument);
    const interactionId = crypto.randomUUID();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    for (const text of ["a", "ab"])
      applyEdit(
        resourceId,
        updateBlockNodeProps<TextNodeProps>("/content/0", {
          content: { content: [{ content: [{ text, type: "text" }], type: "paragraph" }], type: "doc" },
        }),
        TEST_TEXT_LABEL,
        interactionId,
      ).match(noop, console.error);
    const pastLength = pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length;
    undo(resourceId);

    expect(pastLength).toBe(1);
    expect(getDocument(resourceId)).toStrictEqual(textDocument);
  });

  test("two inserts at one index in one interaction are two undo entries", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, insertAtFirstIndex(TEST_THIRD_ID), TEST_MOVE_LABEL, interactionId).match(noop, (error) => {
      throw error;
    });
    applyEdit(resourceId, insertAtFirstIndex("d"), TEST_MOVE_LABEL, interactionId).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_C_INSERTED_DOCUMENT);

    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
  });

  test("undo stops at the oldest kept entry", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const editCount = MAX_PAGE_BUILDER_HISTORY_SIZE + 1;
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    for (let edit = 0; edit < editCount; edit += 1)
      applyEdit(
        resourceId,
        updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: `${edit}` }),
        TEST_LABEL_LABEL,
      ).match(noop, (error) => {
        throw error;
      });
    for (let attempt = 0; attempt < editCount; attempt += 1) undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(
      applyBlockEdit(
        webpageDocumentSchema,
        TEST_DOCUMENT,
        updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: "0" }),
      ).match(
        ({ document }) => document,
        (error) => {
          throw error;
        },
      ),
    );
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("redo reapplies an undone edit", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL).match(noop, (error) => {
      throw error;
    });
    const movedDocument = getDocument(resourceId);
    undo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(movedDocument);
  });

  test("a new edit after undo discards the redo entry", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getRedoLabel, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);
    const redoLabelAfterUndo = getRedoLabel(resourceId);
    applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      TEST_LABEL_LABEL,
    ).match(noop, (error) => {
      throw error;
    });
    const editedDocument = getDocument(resourceId);
    redo(resourceId);

    expect(redoLabelAfterUndo).toBe(TEST_MOVE_LABEL);
    expect(getRedoLabel(resourceId)).toBe("");
    expect(getDocument(resourceId)).toStrictEqual(editedDocument);
  });

  test("reloading a document leaves nothing to undo", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, clearHistory, getUndoLabel, undo } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      TEST_LABEL_LABEL,
    ).match(noop, (error) => {
      throw error;
    });
    const editedDocument = getDocument(resourceId);
    clearHistory(resourceId);
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(editedDocument);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("a save stores the whole document after edits", async () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, saveDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit } = pageBuilderHistoryStore;
    applyEdit(resourceId, moveFirstToEnd(), TEST_MOVE_LABEL).match(noop, (error) => {
      throw error;
    });
    applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      TEST_LABEL_LABEL,
    ).match(noop, (error) => {
      throw error;
    });
    const editedDocument = getDocument(resourceId);
    const writeDocument = vi.fn<(document: WebpageDocument) => Promise<void>>().mockResolvedValue(undefined);
    await saveDocument(resourceId, writeDocument);

    expect(writeDocument).toHaveBeenCalledExactlyOnceWith(editedDocument);
  });

  test("an edit whose operations cannot apply changes neither the document nor the history", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel } = pageBuilderHistoryStore;
    const result = applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/9", { label: "" }),
      TEST_LABEL_LABEL,
    );

    expect(result.match(noop, (error) => error)).toStrictEqual(
      new InvalidOperationError(Operation.Read, "/content/9/props", "no such member"),
    );
    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);
    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("an edit in the same interaction over a different path starts a new entry", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, undo } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      TEST_LABEL_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    const labelEditedDocument = getDocument(resourceId);
    applyEdit(
      resourceId,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { href: TEST_EDITED_URL }),
      "Change link",
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(labelEditedDocument);
  });

  test("an insert and a replace of its path in one interaction stay two entries, and redo restores both", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(resourceId, insertAtFirstIndex(TEST_THIRD_ID), TEST_MOVE_LABEL, interactionId).match(noop, (error) => {
      throw error;
    });
    applyEdit(
      resourceId,
      [{ op: JsonPatchOperationType.Replace, path: "/content/1", value: createButton("d") }],
      TEST_LABEL_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_C_INSERTED_DOCUMENT);

    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);

    redo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({
      content: [createButton(TEST_ID), createButton("d"), createButton(TEST_OTHER_ID)],
      root: TEST_ROOT,
    });
  });

  test("edits over a path and a path under it in one interaction stay two entries, and redo restores both", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      [
        { op: JsonPatchOperationType.Replace, path: "/content", value: [createButton(TEST_THIRD_ID), createButton("d")] },
        { op: JsonPatchOperationType.Replace, path: "/content/1", value: createButton("e") },
      ],
      TEST_MOVE_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    applyEdit(
      resourceId,
      [
        { op: JsonPatchOperationType.Replace, path: "/content/1", value: createButton("f") },
        { op: JsonPatchOperationType.Replace, path: "/content", value: [createButton(TEST_THIRD_ID), createButton("g")] },
      ],
      TEST_LABEL_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({ content: [createButton(TEST_THIRD_ID), createButton("e")], root: TEST_ROOT });

    undo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual(TEST_DOCUMENT);

    redo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({ content: [createButton(TEST_THIRD_ID), createButton("g")], root: TEST_ROOT });
  });

  test("a test after a replace in one interaction stays its own entry, and redo restores the replace", () => {
    expect.hasAssertions();

    const resourceId = setupDocument();
    const interactionId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, redo, undo } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      [{ op: JsonPatchOperationType.Replace, path: "/root/props/lang", value: TEST_OTHER_LANG }],
      TEST_LABEL_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    applyEdit(
      resourceId,
      [{ op: JsonPatchOperationType.Test, path: "/root/props/lang", value: TEST_OTHER_LANG }],
      TEST_LABEL_LABEL,
      interactionId,
    ).match(noop, (error) => {
      throw error;
    });
    undo(resourceId);
    undo(resourceId);
    redo(resourceId);

    expect(getDocument(resourceId)).toStrictEqual({
      ...TEST_DOCUMENT,
      root: { props: { lang: TEST_OTHER_LANG, tokens: {} } },
    });
  });
});

describe(usePageBuilderHistoryStore, () => {
  test("an email edit lands on the email, and undo restores it", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      `<mjml><mj-body><mj-section><mj-column><mj-text></mj-text></mj-column></mj-section></mj-body></mjml>`,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw new Error("the test email should parse");

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, result.data);
    pageBuilderHistoryStore.applyEdit(
      resourceId,
      [{ op: JsonPatchOperationType.Add, path: "/root/props/title", value: "Edited" }],
      "Change title",
    );

    expect(pageBuilderDocumentStore.getEmailDocument(resourceId)?.root.props.title).toBe("Edited");
    expect(pageBuilderDocumentStore.getDocument(resourceId)).toBeUndefined();

    pageBuilderHistoryStore.undo(resourceId);

    expect(pageBuilderDocumentStore.getEmailDocument(resourceId)?.root.props.title).toBeUndefined();
  });
});
