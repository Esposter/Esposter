import { sanitizeFilename } from "#src/services/app/sanitizeFilename";
import { saveEmailForExport } from "#src/services/emailEditor/saveEmailForExport";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useResourceStore } from "#src/store/resource/index";
import { getResultAsync, noop } from "@esposter/shared";

// A file export of the open email: it saves the email first, then writes the file from the saved copy. A refused save writes nothing,
// And a failure is shown to the owner rather than left silent
export const createSavedEmailExport =
  (write: (filename: string, resourceId: string) => Promise<void> | void) => async () => {
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const resourceValue = resource.value;
    if (!resourceValue) return;

    await getResultAsync(async () => {
      if (!(await saveEmailForExport(resourceValue.id))) return;

      await write(sanitizeFilename(resourceValue.name), resourceValue.id);
    }).match(noop, (error) => {
      createErrorAlert(error);
    });
  };
