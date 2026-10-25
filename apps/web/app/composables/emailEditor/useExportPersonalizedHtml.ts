import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { pluralize } from "#shared/util/text/pluralize";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { REOPEN_EMAIL_MESSAGE } from "@/services/emailEditor/constants";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { absolutizeResourceAssetUrls } from "@/services/resource/absolutizeResourceAssetUrls";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";

// The personalised export compiles the stored working copy on the server, so it runs with the editor closed. The command
// Bar and the truncation confirm share these two steps: the email is compiled once, then each row fills in the same html
export const useExportPersonalizedHtml = () => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const compileStoredEmail = async (resourceId: string) => {
    const { datasetReference, html } = await $trpc.email.generateEmailHtml.query({ id: resourceId });
    return { datasetReference, html: absolutizeResourceAssetUrls(html, window.location.origin) };
  };
  // Names the email the rows were read for: the rows are read for one email, so once the reader has moved to another
  // They would be rendered into a template they were never read for and downloaded under its name
  const exportRows = (resourceId: string, html: string, rows: Record<string, ColumnValue>[]) => {
    const resourceValue = resource.value;
    if (resourceValue?.id !== resourceId) {
      createAlert(REOPEN_EMAIL_MESSAGE, "warning");
      return;
    }

    const filename = sanitizeFilename(resourceValue.name);
    const count = exportPersonalizedHtml(
      filename,
      Object.fromEntries(rows.map((row, index) => [`${filename}-${index + 1}`, substituteMergeFields(html, row)])),
    );
    createAlert(`Exported ${count} personalized ${pluralize("email", count)}`, "success");
  };
  return { compileStoredEmail, exportRows };
};
