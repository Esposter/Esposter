import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { getResult, JsonPatchOperationType } from "@esposter/shared";
import { parseMjmlDocument } from "mjml-blocks";

// Replaces the open email's body and head with the document read from MJML source, as one edit the history records under
// One label. A source the email types do not take leaves the email as it was, and the alert names each thing that did not
// Fit. The answer is whether the email took the source, so the dialog that asked for it stays open on a refusal
export const useImportEmailSource = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  return (resourceId: string, source: string) =>
    getResult(() =>
      parseMjmlDocument(source, emailRegistry, emailBodyChildrenSchema, noteRichText, MAX_EMAIL_NODES),
    ).match(
      (result) => {
        if (!result.success) {
          // A refusal names the tag, attribute or value it is about, and one repeated across nodes is named once
          const refusals = new Set(result.error.issues.map(({ message }) => message));
          createAlert(`Could not import the MJML: ${[...refusals].join("; ")}`, "error");
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
};
