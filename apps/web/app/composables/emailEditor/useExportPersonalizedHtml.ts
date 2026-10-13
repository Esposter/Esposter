import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { RESOURCE_ASSET_URL_REGEX } from "#shared/services/resource/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { OPEN_EMAIL_EDITOR_MESSAGE } from "@/services/emailEditor/constants";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { getEmailHtml } from "@/services/emailEditor/getEmailHtml";
import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useResourceStore } from "@/store/resource";

// The command bar exports straight away and the truncation confirm exports after the user decides, so both
// Go through one runner rather than each re-deriving the editor, the resource, and the success alert
export const useExportPersonalizedHtml = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const emailEditorStore = useEmailEditorStore();
  const { editor } = storeToRefs(emailEditorStore);
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  // Names the email the rows were read for: the live editor is the open email's, so rows read for one the reader has
  // Since left would be rendered into another's template and downloaded under its name
  return (resourceId: string, rows: Record<string, ColumnValue>[]) => {
    const editorValue = editor.value;
    const resourceValue = resource.value;
    if (!editorValue || resourceValue?.id !== resourceId) {
      createAlert(OPEN_EMAIL_EDITOR_MESSAGE, "warning");
      return;
    }

    // Asset urls are absolutized so the downloaded artifact points back at the app instead of resolving relative
    // To wherever the file was opened. They only load where the request carries the owner's session cookie, so a
    // File opened straight off disk shows broken images — durable public asset urls are the email-sending follow-on
    const html = getEmailHtml(editorValue).replaceAll(
      RESOURCE_ASSET_URL_REGEX,
      (url) => `${window.location.origin}${url}`,
    );
    const filename = sanitizeFilename(resourceValue.name);
    const count = exportPersonalizedHtml(
      filename,
      Object.fromEntries(rows.map((row, index) => [`${filename}-${index + 1}`, substituteMergeFields(html, row)])),
    );
    createAlert(`Exported ${count} personalized ${pluralize("email", count)}`, "success");
  };
};
