import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { JsonPatchOperationType } from "@esposter/shared";
import { applyBlockEdit } from "headless-block-editor";
import { describe, expect, test } from "vitest";

const EDIT_POINTER = `/content/${MAX_WEBPAGE_NODES / 2}/props/content`;
const EDIT_CONTENT = { content: [{ content: [{ text: "Edited", type: "text" }], type: "paragraph" }], type: "doc" };

describe("applyWebpageEdit", () => {
  test("an edit's inverse restores the document exactly", () => {
    expect.hasAssertions();

    const document = createTestTextDocument(MAX_WEBPAGE_NODES);
    applyBlockEdit(webpageDocumentSchema, document, [
      { op: JsonPatchOperationType.Replace, path: EDIT_POINTER, value: EDIT_CONTENT },
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
});
