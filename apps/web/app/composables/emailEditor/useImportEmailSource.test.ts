// @vitest-environment nuxt
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { useImportEmailSource } from "@/composables/emailEditor/useImportEmailSource";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { useAlertStore } from "@/store/alert";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { MjmlNodeType, parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(useImportEmailSource, () => {
  const TEST_EXISTING_SOURCE =
    "<mjml><mj-body><mj-section><mj-column><mj-text></mj-text></mj-column></mj-section></mj-body></mjml>";
  const TEST_IMPORTED_SOURCE =
    "<mjml><mj-body><mj-section><mj-column><mj-button></mj-button></mj-column></mj-section></mj-body></mjml>";
  const TEST_INCLUDE_SOURCE =
    '<mjml><mj-head><mj-include path="./header.mjml"></mj-include></mj-head><mj-body></mj-body></mjml>';
  const setupEmail = () => {
    const result = parseMjmlDocument(
      TEST_EXISTING_SOURCE,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw new Error("the test email should parse");

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setEmailDocument } = pageBuilderDocumentStore;
    setEmailDocument(resourceId, emailKind, result.data);
    return { existingDocument: result.data, resourceId };
  };

  test("Importing MJML replaces the email", () => {
    expect.hasAssertions();

    const { existingDocument, resourceId } = setupEmail();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getEmailDocument } = pageBuilderDocumentStore;
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { undo } = pageBuilderHistoryStore;
    const importEmailSource = useImportEmailSource();
    const isImported = importEmailSource(resourceId, TEST_IMPORTED_SOURCE);
    expect(isImported).toBe(true);
    expect(getEmailDocument(resourceId)?.content).toMatchObject([
      {
        props: { children: [{ props: { children: [{ type: MjmlNodeType.Button }] }, type: MjmlNodeType.Column }] },
        type: MjmlNodeType.Section,
      },
    ]);

    undo(resourceId);
    expect(getEmailDocument(resourceId)).toStrictEqual(existingDocument);
  });

  test("An import that does not fit leaves the email as it was", () => {
    expect.hasAssertions();

    const { existingDocument, resourceId } = setupEmail();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getEmailDocument } = pageBuilderDocumentStore;
    const importEmailSource = useImportEmailSource();
    const isImported = importEmailSource(resourceId, TEST_INCLUDE_SOURCE);
    expect(isImported).toBe(false);
    expect(getEmailDocument(resourceId)).toStrictEqual(existingDocument);
    expect(alerts.value.map(({ text }) => text)).toStrictEqual([
      'Could not import the MJML: Unrecognized key: "<mj-include>"',
    ]);
  });
});
