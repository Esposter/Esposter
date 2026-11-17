import { ResourceSaveState } from "#src/models/resource/ResourceSaveState";
import { EMAIL_NOT_SAVED_MESSAGE } from "#src/services/emailEditor/constants";
import { useAlertStore } from "#src/store/alert";
import { useEmailEditorStore } from "#src/store/emailEditor/index";
import { useResourceStore } from "#src/store/resource/index";

// An export reads the email the server holds, so the open email's latest edit is saved first. A save the server refuses leaves the
// Stored copy behind the editor, so the export stops and says so rather than downloading the older copy
export const saveEmailForExport = async (resourceId: string): Promise<boolean> => {
  const emailEditorStore = useEmailEditorStore();
  const { saveEmail } = emailEditorStore;
  const resourceStore = useResourceStore();
  const { saveState } = storeToRefs(resourceStore);
  const { whenContentSaved } = resourceStore;
  saveEmail(resourceId);
  await whenContentSaved(resourceId);
  // The save is refused when it failed, or when another session moved the resource on
  const isRefused = saveState.value === ResourceSaveState.Failed || saveState.value === ResourceSaveState.Stale;
  if (!isRefused) return true;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(EMAIL_NOT_SAVED_MESSAGE, "error");
  return false;
};
