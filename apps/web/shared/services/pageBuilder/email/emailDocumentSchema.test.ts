import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import { EMAIL_SURVEY_INVITE_TYPE, MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { JsonPatchOperationType } from "@esposter/shared";
import { applyBlockEdit, insertBlockNode } from "headless-block-editor";
import { describe, expect, test } from "vitest";

const createRawNode = (id: string) => ({ props: { content: "", id }, type: "mj-raw" });

describe("emailDocumentSchema", () => {
  test("a document with a duplicate node id is refused", () => {
    expect.hasAssertions();

    const result = emailDocumentSchema.safeParse({
      content: [createRawNode(TEST_ID), createRawNode(TEST_ID)],
      root: { props: {} },
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an id", path: ["content", 1, "props", "id"] },
    ]);
  });

  test("a document over the node limit is refused", () => {
    expect.hasAssertions();

    const result = emailDocumentSchema.safeParse({
      content: Array.from({ length: MAX_EMAIL_NODES + 1 }, (_value, index) => createRawNode(`${index}`)),
      root: { props: {} },
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: `holds more than ${MAX_EMAIL_NODES} nodes`, path: ["content"] },
    ]);
  });

  test("a survey invite sits in an email column", () => {
    expect.hasAssertions();

    const document = {
      content: [
        {
          props: { children: [{ props: { children: [], id: TEST_OTHER_ID }, type: "mj-column" }], id: TEST_ID },
          type: "mj-section",
        },
      ],
      root: { props: {} },
    };
    const columnSlot = "/content/0/props/children/0/props/children";
    const surveyInvite = {
      props: { id: crypto.randomUUID(), label: TEST_LABEL, surveyId: TEST_SURVEY_ID },
      type: EMAIL_SURVEY_INVITE_TYPE,
    };
    const operations = insertBlockNode(document, emailRegistry, columnSlot, 0, surveyInvite);
    const edited = applyBlockEdit(document, operations)._unsafeUnwrap().document;

    expect(operations).toStrictEqual([
      { op: JsonPatchOperationType.Add, path: `${columnSlot}/0`, value: surveyInvite },
    ]);
    expect(emailDocumentSchema.safeParse(edited).success).toBe(true);
  });
});
