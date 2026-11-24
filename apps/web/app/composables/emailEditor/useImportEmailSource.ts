import type { z } from "zod";

import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { getResult, JsonPatchOperationType } from "@esposter/shared";
import { parseMjmlDocument } from "mjml-blocks";

// The one reading of a source by the email's types, so the field's check and the import take the same source
const readEmailSource = (source: string) =>
  getResult(() => parseMjmlDocument(source, emailRegistry, emailBodyChildrenSchema, noteRichText, MAX_EMAIL_NODES));

// A refusal names the tag, attribute or value it is about, and one repeated across nodes is named once
const getRefusalMessage = (error: z.ZodError) =>
  `Could not import the MJML: ${[...new Set(error.issues.map(({ message }) => message))].join("; ")}`;

// The text a field shows for a source the email's types refuse, or true when they take it
const checkEmailSource = (source: string): string | true =>
  readEmailSource(source).match(
    (result) => (result.success ? true : getRefusalMessage(result.error)),
    (error) => error.message,
  );

// Replaces the open email's body and head with a source the email's types take, as one edit the history records under
// One label. The field runs the check as the source is typed, so the dialog only sends a source the email takes; a
// Refusal that reaches the import is alerted with the same wording, and leaves the email as it was
export const useImportEmailSource = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const importEmailSource = (resourceId: string, source: string) =>
    readEmailSource(source).match(
      (result) => {
        if (!result.success) {
          createAlert(getRefusalMessage(result.error), "error");
          return false;
        }

        return applyEdit(
          resourceId,
          [
            { op: JsonPatchOperationType.Replace, path: "/content", value: result.data.content },
            { op: JsonPatchOperationType.Replace, path: "/root", value: result.data.root },
          ],
          "Import MJML",
        ).match(
          () => true,
          (error) => {
            createErrorAlert(error);
            return false;
          },
        );
      },
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  return { checkEmailSource, importEmailSource };
};
