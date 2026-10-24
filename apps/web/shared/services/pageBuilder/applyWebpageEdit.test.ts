import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { TEST_EDIT_CONTENT, TEST_EDIT_POINTER } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { JsonPatchOperationType } from "@esposter/shared";
import { applyBlockEdit } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(applyBlockEdit, () => {
  test("an edit's inverse restores the document exactly", () => {
    expect.hasAssertions();

    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    applyBlockEdit(webpageDocumentSchema, document, [
      { op: JsonPatchOperationType.Replace, path: TEST_EDIT_POINTER, value: TEST_EDIT_CONTENT },
    ]).match(
      ({ document: edited, inverses }) => {
        applyBlockEdit(webpageDocumentSchema, edited, inverses).match(
          ({ document: restored }) => {
            expect(restored).toStrictEqual(document);
          },
          (error) => {
            throw error;
          },
        );
      },
      (error) => {
        throw error;
      },
    );
  });

  test("a single edit to a 2,000-node document changes the node it names and no other", () => {
    expect.hasAssertions();

    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    const editedIndex = MAX_WEBPAGE_NODES / 2;
    applyBlockEdit(webpageDocumentSchema, document, [
      { op: JsonPatchOperationType.Replace, path: TEST_EDIT_POINTER, value: TEST_EDIT_CONTENT },
    ]).match(
      ({ document: edited }) => {
        const expected = createTestTextDocument(MAX_WEBPAGE_NODES);
        expect(edited.content[editedIndex]?.props.content).toStrictEqual(TEST_EDIT_CONTENT);
        expect(edited.content.filter((_node, index) => index !== editedIndex)).toStrictEqual(
          expected.content.filter((_node, index) => index !== editedIndex),
        );
      },
      (error) => {
        throw error;
      },
    );
  });
});
