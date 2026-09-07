import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { pluralize } from "#shared/util/text/pluralize";
import { OPEN_EMAIL_EDITOR_MESSAGE } from "@/services/emailEditor/constants";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
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
  return (rows: Record<string, ColumnValue>[]) => {
    const editorValue = editor.value;
    const resourceValue = resource.value;
    if (!editorValue || !resourceValue) {
      createAlert(OPEN_EMAIL_EDITOR_MESSAGE, "warning");
      return;
    }

    const count = exportPersonalizedHtml(editorValue, resourceValue, rows);
    createAlert(`Exported ${count} personalized ${pluralize("email", count)}`, "success");
  };
};
