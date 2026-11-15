import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { pluralize } from "#shared/util/text/pluralize";
import { sanitizeFilename } from "#src/services/app/sanitizeFilename";
import { REOPEN_EMAIL_MESSAGE } from "#src/services/emailEditor/constants";
import { exportPersonalizedHtml } from "#src/services/emailEditor/exportPersonalizedHtml";
import { substituteMergeFields } from "#src/services/emailEditor/substituteMergeFields";
import { useAlertStore } from "#src/store/alert";
import { useResourceStore } from "#src/store/resource/index";

// Names the email the rows were read for: the rows are read for one email, so once the reader has moved to another
// They would be rendered into a template they were never read for and downloaded under its name
export const exportPersonalizedRows = (resourceId: string, html: string, rows: Record<string, ColumnValue>[]) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
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
